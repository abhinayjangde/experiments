package main

import (
	"fmt"
	"time"
)

func f1() {
	for i := range 10 {
		fmt.Println(i)
	}
}
func main() {
	go func() {
		fmt.Println("hello")
	}()

	fmt.Println("main exited")

	time.Sleep(time.Millisecond)
}
