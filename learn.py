def read_file():
    with open("docker-compose.yml", "r") as file:
        for line in file:
            yield line

for log in read_file():
    print(log)