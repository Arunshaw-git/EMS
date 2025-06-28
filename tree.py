
import os
def walk(path, indent=0):
    for item in os.listdir(path):
        full_path = os.path.join(path, item)
        print(' ' * indent + '|-- ' + item)
        if os.path.isdir(full_path):
            walk(full_path, indent + 4)
walk('.')