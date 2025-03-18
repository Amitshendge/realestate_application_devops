import os
from openai import OpenAI
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv


# Load environment variables
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
openai_client = OpenAI(api_key=OPENAI_API_KEY)
pc = Pinecone(api_key=PINECONE_API_KEY)

# Define Pinecone indexes
INDEXES = [
    {"index_name": "real-estate-docs", "namespace": None},
    # {"index_name": "real-estate-index-2", "namespace": None}
]
def embed_text(text):
    response = openai_client.embeddings.create(
        input=[text],
        model="text-embedding-ada-002"
    )
    return response.data[0].embedding

def retrieve_documents(query, top_k=2):
    query_embedding = embed_text(query)
    all_results = []
    for idx_info in INDEXES:
        index = pc.Index(idx_info["index_name"])
        namespace = idx_info.get("namespace")
        result = index.query(
            vector=query_embedding,
            top_k=top_k,
            namespace=namespace,
            include_metadata=True
        )
        if "matches" in result:
            all_results.extend(result["matches"])
    all_results.sort(key=lambda x: x["score"], reverse=True)
    return all_results

# Generate a response based on retrieved documents and user query
def generate_response(documents, query):
    context = "Top-k Retrieved Documents:\n"
    for idx, doc in enumerate(documents, 1):
        metadata = doc.get("metadata", {})
        context += f"Document {idx}: {metadata}\n\n"
    if not context.strip():
        return "I couldn't find relevant information in the documents."
    messages = [
        {
            "role": "system",
            "content": (
                "You are a helpful assistant. When the user asks a question, interpret their query to provide a complete, end-to-end response. If the user's query matches a title, section, or topic in any document, return the entire content of that document or section in full without summarizing, skipping, or condensing any part of it. For example, if the user asks, 'What are the 6 steps required to get the home ready for sale?' and this matches a document, provide the entire content from that document as it is, ensuring no details are omitted. Always assume the user wants the full content unless explicitly asked for a summary or specific details."
            )
        },
        {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {query}"}
    ]
    response = openai_client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        max_tokens=10000,
        temperature=0.9,
        stream=False
    )
    # answer = ""
    # for chunk in response:
    #     if chunk.choices[0].delta.content:
    #         answer += chunk.choices[0].delta.content
    #         print(chunk.choices[0].delta.content, end="")
    #         yield chunk.choices[0].delta.content
    return response.choices[0].message.content

# Main chatbot function
def chatbot(query):
    documents = retrieve_documents(query)
    if not documents:
        return "I couldn't find any relevant information."
    response = generate_response(documents, query)
    return response

if __name__ == "__main__":
    user_query = input("Please enter your question: ")
    print("\nAnswer:")
    for part in chatbot(user_query):
        print(part, end="")