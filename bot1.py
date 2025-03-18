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
INDEXES = [
    {"index_name": "accounting-file-paths-2", "namespace": "final-accounting"},
    {"index_name": "example-index5"},
    {"index_name": "audit-files-2", "namespace": None}
]


def embed_text(text):
    response = openai_client.embeddings.create(
        input=[text],
        model="text-embedding-ada-002"
    )
    return response.data[0].embedding


def retrieve_documents(query, top_k=10):
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


def generate_response(documents, query):
    context = "Top-k Retrieved Documents:\n"
    for idx, doc in enumerate(documents, 1):
        context += f"Metadata: {doc.get('metadata', 'No metadata available')}\n\n"
    if not context.strip():
        return "I couldn't find relevant information in the documents."
    messages = [
        {"role": "system",
         "content": "You are a helpful assistant. Provide hyperlinks (hyperlinks are basically SharePoint_path links) also where file paths related queries are present, also show the full path in proper format with the hyper link just to make the response more clear,always provide full paths in all queries, a very important thing is there are two types of queries coming from the user one can be normal where more info is expected and the other one is where the user is asking for a file path, in the second case always provide the full path in the response, provide file path in both the response but if it is of first type give all the detailed info first, eg give me license number of suresh something like that."},
        {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {query}"}
    ]
    response = openai_client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        max_tokens=3000,
        temperature=0.6,
        stream=False
    )
    # answer = ""
    # for chunk in response:
    #     if chunk.choices[0].delta.content:
    #         answer += chunk.choices[0].delta.content
    #         print(chunk.choices[0].delta.content, end="")
    #         yield chunk.choices[0].delta.content
    return response.choices[0].message.content


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
