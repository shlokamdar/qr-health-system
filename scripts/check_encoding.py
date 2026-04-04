import os

def check_encoding(directory):
    for root, dirs, files in os.walk(directory):
        if '.git' in root or 'node_modules' in root or '.venv' in root or 'venv' in root:
            continue
        for file in files:
            if not file.endswith('.py'): continue
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'rb') as f:
                    content = f.read(2)
                    if content.startswith(b'\xff\xfe') or content.startswith(b'\xfe\xff'):
                        print(f"UTF-16 issue in {filepath}")
            except Exception:
                pass

if __name__ == "__main__":
    check_encoding('.')
