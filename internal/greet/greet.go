package greet

func Greet(names ...string) string {
	name := "Guest"
	if len(names) > 0 {
		name = names[0]
	}

	return "Hello, " + name
}
