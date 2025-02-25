import os, shutil
import markdown2

BASE = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
INPUT = os.path.join(BASE, "content")
OUTPUT = os.path.join(BASE, "docs")
DEFAULT_WRAPPER_NAME = ".wrapper-default.html"
WRAPPER_FOLDER_NAME = ".wrapper"

WRAPPER_REPLACE_SEQUENCE = "<!>"

path_level = lambda p : p.replace("/", "\\").count("\\")
print(BASE, "\n")
BASE_LEVEL = path_level(BASE)

def reduce_path_level(path, n):
    for i in range(n):
        path = os.path.dirname(path)
    return path

# Custom wrappers must be specified in the ".wrapper" folder of the file's directory.
# If there is no custom wrapper, look for an applicable template wrapper to the base of content.
# Returns the path to the wrapper file.
def find_wrapper(file_name, path):
    wrapper_folder_path = os.path.join(path, WRAPPER_FOLDER_NAME)
    
    default_wrapper_path = os.path.join(wrapper_folder_path, DEFAULT_WRAPPER_NAME)
    
    custom_wrapper_name = "wrapper-" + file_name.replace(".md", ".html")
    custom_wrapper_path = os.path.join(wrapper_folder_path, custom_wrapper_name)
    
    if os.path.isfile(custom_wrapper_path):
        print(f"Associating {file_name} with {custom_wrapper_name}")
        return custom_wrapper_path
        
    # search down to content, looking for ".wrapper\wrapper.default" along the way
    while path_level(default_wrapper_path) - 2 > BASE_LEVEL:
        if os.path.isfile(default_wrapper_path):
            return default_wrapper_path
        else:
            default_wrapper_path = reduce_path_level(default_wrapper_path, 3)
            default_wrapper_path = os.path.join(default_wrapper_path, ".wrapper", DEFAULT_WRAPPER_NAME)
            
    return None

def md_to_html(input_path, output_path):
    for path, folders, files in os.walk(INPUT):
        for file_name in files:
            if file_name.endswith(".md"):
                input_file = os.path.join(path, file_name)
                input_relpath = os.path.relpath(input_file, input_path).replace(".md", ".html")
                output_file = os.path.join(output_path, input_relpath)
                
                os.makedirs(os.path.dirname(output_file), exist_ok=True)
                
                # find wrapper or base wrapper
                wrapper_path = find_wrapper(file_name, os.path.dirname(input_file))
                
                with open(input_file, "r", encoding="utf-8") as f_md:
                    md_contents = f_md.read()
                    if not wrapper_path == None:
                        with open(wrapper_path, "r", encoding="utf-8") as f_wrapper:
                            wrapper_contents = f_wrapper.read()
                            html_content = wrapper_contents.replace(WRAPPER_REPLACE_SEQUENCE, markdown2.markdown(md_contents))
                    else:
                        html_content = markdown2.markdown(f.read())
                    
                with open(output_file, "w", encoding="utf-8") as f:
                    f.write(html_content)
                    print(f"Writing {output_file}")
            elif not path.endswith(".wrapper"): 
                input_file = os.path.join(path, file_name)
                shutil.copy(input_file, output_path)
                print(f"Copying {input_file}")
                
if __name__ == "__main__":
    md_to_html(INPUT, OUTPUT)