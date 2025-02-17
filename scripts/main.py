import os
import markdown2

INPUT = "..\content"
OUTPUT = "..\docs"

def md_to_html(input_path, output_path):
    for path, folders, files in os.walk(INPUT):
        for file in files:
            if file.endswith(".md"):
                input_file = os.path.join(path, file)
                input_relpath = os.path.relpath(input_file, input_path).replace(".md", ".html")
                output_file = os.path.join(output_path, input_relpath)
                
                os.makedirs(os.path.dirname(output_file), exist_ok=True)
                
                with open(input_file, "r", encoding="utf-8") as f:
                    html_content = markdown2.markdown(f.read)
                    
                with open(output_file, "w", encoding="utf-8") as f:
                    f.write(html_content)
                    print(f"Writing {output_file}")
                
if __name__ == "__main__":
    md_to_html(INPUT, OUTPUT)