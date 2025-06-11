import os
import transformers

# Get the cache directory
cache_dir = transformers.file_utils.default_cache_path

# Delete all files in the cache directory
for file in os.listdir(cache_dir):
    file_path = os.path.join(cache_dir, file)
    if os.path.isfile(file_path):
        os.remove(file_path)

print("All downloaded models have been deleted")