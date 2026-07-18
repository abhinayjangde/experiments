import { formatDate } from "@myapp/utils"
import './App.css'
import { useEffect, useState } from "react"

function App() {

  const [msg, setMsg] = useState<string>("")

  useEffect(() => {

    async function fetchData() {
      const res = await fetch("http://localhost:9000/api")
      const data = await res.json()
      setMsg(data.message)
    }

    fetchData()
  }, [])


  return (
    <>
      <div>{formatDate(new Date())} {msg}</div>
    </>
  )
}

export default App
