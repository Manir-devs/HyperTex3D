#copy.py used for copy my project's source code :)
import os
import pyperclip
def bundle_and_copy():
    
    target_files = [
       
    
        "build.sh",
        "Makefile",
        "src/ui.c",
        "src/main.c",
        "src/fileio.c",
        "src/engine.c",
        "src/hypertex.h"
        
    ]

    output_filename = "temp.txt"
    base_path = os.getcwd() 
    all_content = "" 

    print(f"Scanning project files in: {base_path}\n")

    try:
        
        with open(output_filename, 'w', encoding='utf-8') as outfile:
            found_count = 0
            
            for file_path in target_files:
                full_path = os.path.join(base_path, file_path)
                
                if os.path.exists(full_path):
                    try:
                        with open(full_path, 'r', encoding='utf-8') as infile:
                            content = infile.read()
                            
                            
                            file_block = f"--- {file_path} ---\n{content}\n\n"
                            outfile.write(file_block)
                            all_content += file_block
                            print(f"Added & Cached: {file_path}")
                            found_count += 1
                    except Exception as e:
                        print(f"Error reading {file_path}: {e}")
                else:
                    print(f"⚠️  Skipped (Not found): {file_path}")

            
            if all_content:
                pyperclip.copy(all_content)
                print(f"\nDone! '{output_filename}' is ready and all the texts are copied.")
            else:
                print("\nNothing to copy.")

    except Exception as e:
        print(f"Fatal error: {e}")

if __name__ == "__main__":
    bundle_and_copy()

