import os

file_path = r'd:\vs_code_file\Project_22\safebridge\frontend\src\context\LanguageContext.tsx'
with open(file_path, 'rb') as f:
    data = bytearray(f.read())

if len(data) > 19620:
    print(f"Byte at 19620: {data[19620]:02x}")
    if data[19620] == 0x95:
        data[19620] = 0x20  # Replace with space
        with open(file_path, 'wb') as f:
            f.write(data)
        print("Fixed byte at 19620")
    else:
        print("Byte at 19620 is not 0x95")
else:
    print("File is too short")
