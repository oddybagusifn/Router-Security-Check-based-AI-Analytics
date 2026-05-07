import google.generativeai as genai

genai.configure(api_key="AIzaSyAJCxKt2zpXzUr5AxDsUHUqx0yN9Elgjz4")

for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        print(m.name)