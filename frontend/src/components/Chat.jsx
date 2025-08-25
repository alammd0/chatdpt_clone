import { useState } from "react";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (message.trim() === "") {
      return;
    }

    const newMessage = { sender: "you", text: message };
    setChat((prev) => [...prev, newMessage]);
    setMessage("");

    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:5000/api/v1/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
        }),
      });

      const backendResponse = await response.json();
      const aiMessage = { sender: "ai", text: backendResponse.message };
      setChat((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  console.log(chat);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSubmit(e);
    }

    console.log(e.key);
  };

  return (
    <div className="max-w-8/12 mx-auto w-full flex flex-col justify-between">
      <div className="mb-[120px]">
        {chat.map((mes, index) => (
          <div
            key={index}
            className={`flex ${
              mes.sender === "you" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`p-3 rounded-xl max-w-8/12 ${
                mes.sender !== "you"
                  ? "my-2 bg-[#2c2c2c] text-white"
                  : "my-2 bg-gray-700 text-white"
              }`}
            >
              {mes.text}
            </div>
          </div>
        ))}

        {/* Loading spinner should not replace chat */}
        {isLoading && (
          <div className="flex justify-start items-center my-2">
            <svg
              className="animate-spin h-6 w-6 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 
                    0 12h4zm2 5.291A7.962 7.962 0 014 
                    12H0c0 3.042 1.135 5.824 
                    3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="ml-2 text-gray-300">AI is typing...</span>
          </div>
        )}
      </div>

      <div className=" fixed inset-x-0 bottom-5 max-w-8/12 mx-auto bg-[#2c2c2c] rounded-2xl p-5 flex flex-col gap-5 shadow-2xl shadow-gray-400/10">
        <div className="flex items-center justify-between">
          <div className="cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </div>
          <textarea
            value={message}
            onKeyDown={handleKeyDown}
            onChange={(e) => setMessage(e.target.value)}
            name="message"
            rows={1}
            id="message"
            className="w-full rounded-lg p-2 bg-[#2c2c2c] text-white outline-none resize-none"
            placeholder="Ask me anything..."
          ></textarea>
          <div
            className="cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
