package server

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func NewRouter() *gin.Engine {
	r := gin.Default()

	r.GET("/health", func(ctx *gin.Context) {
		ctx.JSON(http.StatusOK, gin.H{
			"ok":        true,
			"status":    "healthy",
			"timestamp": time.Now().UTC(),
		})
	})

	r.GET("/", func(ctx *gin.Context) {
		ctx.String(http.StatusOK, "Server is running...")
	})

	return r
}
