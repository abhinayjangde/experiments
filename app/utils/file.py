import os
import aiofiles

async def save_to_disk(file: bytes, path: str) -> bool:
    """
    Asynchronously saves a file to disk at the specified path.
    Args:
        file (bytes): The file content to be saved.
        path (str): The destination file path where the content will be saved.
    Returns:
        bool: True if the file was saved successfully, False otherwise.
    Raises:
        This function handles all exceptions internally and prints an error message if saving fails.
    """

    os.makedirs(os.path.dirname(path), exist_ok=True)

    try:
        async with aiofiles.open(path, 'wb') as out_file:
            await out_file.write(file)
        return True
    except Exception as e:
        print(f"Error saving file to disk: {e}")
        return False