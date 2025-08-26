import AppBar from "./components/Appbar"
import Chat from "./components/Chat"


function App() {

  return (
    <>
      <div className="bg-[#212121] min-h-screen text-white p-4">
          <AppBar />
          <Chat />
      </div>
    </>
  )
}

export default App
