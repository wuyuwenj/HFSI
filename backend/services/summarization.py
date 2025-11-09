"""Document summarization service using Ollama."""
import logging
from typing import List
from langchain_ollama import ChatOllama

from langchain_classic.chains.summarize import load_summarize_chain
from langchain_core.documents import Document
from langchain_core.prompts import PromptTemplate
from config import settings

logger = logging.getLogger(__name__)


class DocumentSummarizer:
    """Service for summarizing documents using LLM."""
    
    def __init__(self):
        """Initialize ChatOllama for summarization."""
        self.llm = ChatOllama(
            model=settings.OLLAMA_MODEL,
            base_url=settings.OLLAMA_BASE_URL,
            temperature=0,
            keep_alive="5m"
        )
    
    def summarize_documents(self, chunks: List[str], client_name: str) -> str:
        """
        Summarize documents using LangChain's map_reduce chain.
        
        Args:
            chunks: List of document chunk texts
            client_name: Client name for context
            
        Returns:
            Generated summary text
        """
        # Convert chunks to Document objects
        documents = [Document(page_content=chunk) for chunk in chunks]
        
        # Define map prompt
        map_prompt = PromptTemplate(
            input_variables=["text"],
            template="""You are a legal document analyst. Analyze the following document chunk and extract key information.

Focus on:
- Document types and categories
- Key parties involved
- Important dates and deadlines
- Obligations and responsibilities
- Critical clauses and terms
- Legal issues and concerns
- Financial terms if applicable

Document chunk:
{text}

Summary:"""
        )
        
        # Define combine prompt (map_reduce uses "text" variable for combined summaries)
        combine_prompt = PromptTemplate(
            input_variables=["text"],
            template="""You are a legal document analyst creating a comprehensive summary.

Synthesize the following summaries into a coherent, professional summary covering:

1. Document Overview: Types of documents, their purposes
2. Key Parties: Names and roles of all parties involved
3. Timeline: Important dates, deadlines, and timeframes
4. Obligations: Responsibilities and requirements for each party
5. Critical Clauses: Important legal terms and conditions
6. Legal Issues: Potential concerns or areas requiring attention
7. Financial Terms: Payment schedules, amounts, penalties (if applicable)

Summaries:
{text}

Provide a clear, structured summary suitable for legal professionals:"""
        )
        
        # Load summarize chain with map_reduce
        chain = load_summarize_chain(
            llm=self.llm,
            chain_type="map_reduce",
            map_prompt=map_prompt,
            combine_prompt=combine_prompt,
            verbose=True
        )
        
        try:
            # Run summarization - map_reduce chain expects input_documents
            # We'll format the combine prompt to include client_name in the text
            result = chain.invoke({"input_documents": documents})
            
            # Add client context to the summary
            summary_text = result.get("output_text", "")
            if summary_text:
                final_summary = f"Client: {client_name}\n\n{summary_text}"
            else:
                final_summary = summary_text
            
            logger.info(f"Generated summary for client: {client_name}")
            return final_summary
            
        except Exception as e:
            logger.error(f"Error generating summary: {e}")
            # Return a basic summary if LLM fails
            return f"Summary generation encountered an error. {len(chunks)} document chunks processed for {client_name}."
