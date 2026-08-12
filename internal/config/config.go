package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port string
	Env  string
}

func MustLoad() Config {
	godotenv.Load()

	port := os.Getenv("PORT")
	if port == "" {
		panic("PORT is required in .env")
	}

	env := os.Getenv("ENV")
	if env == "" {
		panic("ENV is required in .env file")
	}
	return Config{
		Port: port,
		Env:  env,
	}
}
