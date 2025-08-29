import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState(false);

  const conversationId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  // console.log(conversationId);

  // const userId = Math.random().toString(36).substring(2, 15);

  const handleSubmit = async () => {
    if (message.trim() === "") {
      return;
    }

    const newMessage = { sender: "user", text: message };
    setChat((prev) => [...prev, newMessage]);
    setMessage("");

    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:5000/api/v1/c/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
          conversationId: conversationId,
        }),
      });

      const backendResponse = await response.json();
      console.log(backendResponse);

      const aiMessage = { sender: "assistant", text: backendResponse.message };
      setChat((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSubmit(e);
    }

    console.log(e.key);
  };

  const handleClickCopy = (code) => {
     navigator.clipboard.writeText(code)
     .then( () => {
       setCode(true);
       setTimeout( () => setCode(false), 2000);
     })
  }

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
              className={`p-3 rounded-xl  ${
                mes.sender !== "you"
                  ? ""
                  : "my-2 bg-gray-700 text-white"
              }`}
            >
              {
                mes.sender === "you" ? (
                  <p className="my-2 bg-gray-700 text-white flex justify-end">{mes.text}</p>
                ) : (
                  <div class="p-4 rounded-lg w-full">
                       <ReactMarkdown
                          children={mes.text}
                          components={{
                            code({ node, inline, className, children, ...props }) {
                              const match = /language-(\w+)/.exec(className || "");
                              const codeString= String(children).replace(/\n$/, "");
                              return !inline && match ? (
                                  <div className="relative group">
                                      <button className="absolute right-2 top-2 bg-gray-700 text-white text-xs px-2 py-1 rounded hover:bg-gray-600" onClick={() => handleClickCopy(codeString)}>
                                        {code ? "Copied!" : "Copy"}
                                      </button>
                                      <SyntaxHighlighter
                                          style={oneDark}
                                          language={match[1]}
                                          PreTag="div"
                                          {...props}
                                        >
                                          {codeString}
                                      </SyntaxHighlighter>
                                  </div>
                              ) : (
                               
                                   <code className="bg-gray-800 px-1 rounded" {...props}>
                                      {children}
                                    </code>
                                
                              );
                            }
                          }}
                        />
                  </div>
                )
              }
            </div>
          </div>
        ))}

        {/* Loading spinner should not replace chat */}
        {isLoading && (
          <div className="flex items-center space-x-2 text-gray-300">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></span>
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
