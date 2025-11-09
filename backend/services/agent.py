"""RAG agent service with citation tracking."""

import logging
from typing import List, Dict, Any
from langchain_ollama import ChatOllama
from langchain_core.tools import Tool
from langchain_classic.agents import AgentExecutor, create_react_agent

from langchain_core.prompts import PromptTemplate
from langchain_core.documents import Document
from config import settings
from services.neo4j_store import Neo4jVectorStore
from models.schemas import Citation

logger = logging.getLogger(__name__)


class LegalRAGAgent:
    """RAG agent for legal document queries with citation tracking."""

    def __init__(self, vector_store: Neo4jVectorStore):
        """
        Initialize RAG agent.

        Args:
            vector_store: Neo4jVectorStore instance for document retrieval
        """
        self.vector_store = vector_store
        self.llm = ChatOllama(
            model=settings.OLLAMA_MODEL,
            base_url=settings.OLLAMA_BASE_URL,
            temperature=0,
            keep_alive="5m",
        )

    def _create_retrieval_tool(self, client_doc_id: str) -> Tool:
        """
        Create retrieval tool for client-specific document search.

        Args:
            client_doc_id: Client document ID for scoping

        Returns:
            LangChain Tool for document retrieval
        """

        def retrieve_documents(query: str) -> str:
            """Retrieve relevant documents for the query."""
            try:
                docs = self.vector_store.search_by_client(query, client_doc_id, k=4)

                # Format documents with citations
                formatted_docs = []
                for doc in docs:
                    source = doc.metadata.get("source", "Unknown")
                    location = doc.metadata.get("location", "")
                    citation = f"[{source}, {location}]"
                    formatted_docs.append(f"{citation}\n{doc.page_content}")

                return "\n\n---\n\n".join(formatted_docs)
            except Exception as e:
                logger.error(f"Error retrieving documents: {e}")
                return f"Error retrieving documents: {str(e)}"

        return Tool(
            name="document_retrieval",
            description=f"""Use this tool to retrieve relevant legal documents for the client (doc_id: {client_doc_id}).
            Always use this tool BEFORE answering any question to get the most up-to-date information.
            Input should be a clear question or search query about the legal documents.""",
            func=retrieve_documents,
        )

    def create_agent_for_client(self, client_doc_id: str) -> AgentExecutor:
        """
        Build LangChain agent with retrieval tool for a specific client.

        Args:
            client_doc_id: Client document ID

        Returns:
            Configured AgentExecutor
        """
        # Create retrieval tool
        retrieval_tool = self._create_retrieval_tool(client_doc_id)

        # System prompt for the agent (ReAct format)
        system_prompt = PromptTemplate.from_template(
            """You are a professional legal assistant helping lawyers query legal documents.

CRITICAL RULES:
1. ALWAYS use the document_retrieval tool FIRST before answering any question
2. MANDATORY citation format: [filename, location] where location is "p.X" for pages or "para.X" for paragraphs
3. Client-scoped access only - you can ONLY access documents for client doc_id: {client_doc_id}
4. NEVER fabricate information or citations - only cite what you retrieve
5. If information is not found in the documents, clearly state that

Answer Structure:
- Direct Answer: Provide a clear, concise answer to the question
- Detailed Analysis: Explain the reasoning and context
- Citations: Include precise citations for every factual claim in format [filename, location]
- Considerations: Note any important caveats or related information

TOOLS:
------

You have access to the following tools:

{tools}

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question with proper citations

Begin!

Question: {input}
Thought: {agent_scratchpad}"""
        )

        # Create agent
        agent = create_react_agent(
            llm=self.llm, tools=[retrieval_tool], prompt=system_prompt
        )

        # Create agent executor
        agent_executor = AgentExecutor(
            agent=agent,
            tools=[retrieval_tool],
            verbose=True,
            handle_parsing_errors=True,
            max_iterations=3,
        )

        return agent_executor

    def query(self, question: str, client_doc_id: str) -> Dict[str, Any]:
        """
        Process query and return answer with citations.

        Args:
            question: User question
            client_doc_id: Client document ID

        Returns:
            Dictionary with answer and citations
        """
        try:
            # Create agent for this client
            agent = self.create_agent_for_client(client_doc_id)

            # Execute query
            result = agent.invoke({"input": question, "client_doc_id": client_doc_id})

            answer = result.get("output", "")

            # Extract citations from answer
            citations = self._extract_citations(answer)

            return {
                "answer": answer,
                "citations": citations,
                "client_doc_id": client_doc_id,
            }

        except Exception as e:
            logger.error(f"Error processing query: {e}")
            raise

    def _extract_citations(self, answer: str) -> List[Citation]:
        """
        Extract citations from answer text.

        Args:
            answer: Answer text containing citations

        Returns:
            List of Citation objects
        """
        import re

        citations = []
        # Pattern to match [filename, location] format
        pattern = r"\[([^,\]]+),\s*([^\]]+)\]"

        matches = re.findall(pattern, answer)

        for filename, location in matches:
            citations.append(
                Citation(filename=filename.strip(), location=location.strip())
            )

        # Remove duplicates while preserving order
        seen = set()
        unique_citations = []
        for citation in citations:
            key = (citation.filename, citation.location)
            if key not in seen:
                seen.add(key)
                unique_citations.append(citation)

        return unique_citations
