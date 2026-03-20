#!/usr/bin/env python3
"""Split consolidated Java files into individual files - one public class per file"""

import re
import os

def split_java_file(input_file, output_dir):
    """Split a Java file with multiple classes into individual files"""
    
    with open(input_file, 'r') as f:
        content = f.read()
    
    # Extract package declaration
    package_match = re.search(r'package\s+([^;]+);', content)
    if not package_match:
        print(f"No package found in {input_file}")
        return
    
    package_name = package_match.group(1)
    
    # Extract all imports (keep these for each file)
    imports_section = ''
    imports_match = re.search(r'((?:import\s+[^;]+;\s*\n)*)', content)
    if imports_match:
        imports_section = imports_match.group(1)
    
    # Find all class definitions
    # Pattern: optional @annotations followed by class declaration
    class_pattern = r'((?:@\w+\s*(?:\([^)]*\))?.*?\n)*?)(?:public\s+|)(?:class|interface)\s+(\w+)(?:\s+[^{]*)?(\{(?:[^{}]|(?:\{[^{}]*\}))*\})'
    
    matches = list(re.finditer(class_pattern, content, re.MULTILINE | re.DOTALL))
    
    if not matches:
        print(f"No classes found in {input_file}")
        return
    
    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)
    
    for match in matches:
        annotations = match.group(1).strip()
        class_name = match.group(2)
        class_body = match.group(3)
        
        # Build the new file content
        file_content = f"package {package_name};\n\n{imports_section}\n"
        if annotations:
            file_content += f"{annotations}\n"
        file_content += f"public class {class_name}{class_body}\n"
        
        # Write to file
        output_file = os.path.join(output_dir, f"{class_name}.java")
        with open(output_file, 'w') as f:
            f.write(file_content)
        print(f"Created {output_file}")

# Process the files
files_to_split = [
    ("/Users/akshkaushik/Downloads/cb-ild/backend/src/main/java/org/mifos/cbild/model/Entities.java",
     "/Users/akshkaushik/Downloads/cb-ild/backend/src/main/java/org/mifos/cbild/model"),
    ("/Users/akshkaushik/Downloads/cb-ild/backend/src/main/java/org/mifos/cbild/dto/Dtos.java",
     "/Users/akshkaushik/Downloads/cb-ild/backend/src/main/java/org/mifos/cbild/dto"),
]

for input_file, output_dir in files_to_split:
    if os.path.exists(input_file):
        print(f"\nProcessing {input_file}...")
        split_java_file(input_file, output_dir)
    else:
        print(f"File not found: {input_file}")
