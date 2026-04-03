package main

import (
	"fmt"
)

func main() {

	const (
		port = 8080
		host = "localhost"
	)

	fmt.Printf("Server is running on %s:%d\n", host, port)
}
