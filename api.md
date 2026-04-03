package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// Struct (like model)
type User struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

var users = []User{
	{ID: 1, Name: "Abhi"},
	{ID: 2, Name: "Arya"},
}

// GET API
func getUsers(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}

// POST API
func createUser(w http.ResponseWriter, r *http.Request) {
	var newUser User
	json.NewDecoder(r.Body).Decode(&newUser)

	users = append(users, newUser)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(newUser)
}

func main() {
	http.HandleFunc("/users", getUsers)
	http.HandleFunc("/users/create", createUser)

	fmt.Println("Server running on port 8080")
	http.ListenAndServe(":8080", nil)
}