import io from "socket.io-client";
import { useState, useEffect } from "react";

const socket = io("/");

function App() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [socketId, setSocketId] = useState(null);
  const [users, setUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  // Función para enviar mensajes
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return; // Evitar enviar mensajes vacíos
    socket.emit("message", { user: name, message });
    setMessage("");
  };

  // Función para conectar al usuario
  const handleConnect = () => {
    if (name.trim()) {
      socket.emit("setUser", name);
      setIsConnected(true);
    }
  };

  // Función para desconectar al usuario
  const handleDisconnect = () => {
    socket.emit("disconnectUser", name);
    window.location.reload();
  };

  // Manejo de eventos de Socket.io
  useEffect(() => {
    socket.on("connect", () => setSocketId(socket.id));

    socket.on("message", (data) =>
      setMessages((prevMessages) => [...prevMessages, data])
    );

    socket.on("users", (usersList) => setUsers(usersList));

    socket.on("userDisconnected", (user) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          user: "Sistema",
          message: `${user} se ha desconectado`,
          system: true,
        },
      ]);
    });

    // Cleanup para evitar fugas de memoria
    return () => {
      socket.off("connect");
      socket.off("message");
      socket.off("users");
      socket.off("userDisconnected");
    };
  }, []);

  return (
    <div className="h-screen bg-zinc-800 text-white flex items-center justify-center">
      {isConnected && (
        <div className="bg-zinc-900 p-4 rounded-lg w-1/6 mr-4">
          <h3 className="text-lg font-bold mb-2">Usuarios:</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {users.map((user, index) => (
              <li key={index}>{user}</li>
            ))}
          </ul>
          <button
            onClick={handleDisconnect}
            className="bg-red-600 hover:bg-red-500 mt-4 p-2 w-full rounded-md"
          >
            Desconectarse
          </button>
        </div>
      )}

      <div className="bg-zinc-900 p-10 rounded-lg w-1/3 h-3/4 flex flex-col justify-between">
        {!isConnected ? (
          <div>
            <input
              type="text"
              placeholder="Tu nombre..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mb-4 p-2 w-full bg-zinc-700 text-white border border-zinc-600 rounded"
            />
            <button
              onClick={handleConnect}
              className="bg-sky-600 hover:bg-sky-500 p-2 w-full rounded-md"
            >
              Conectarse al chat
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-y-auto flex-1 mb-4">
              <ul className="space-y-2">
                {messages.map((data, index) => (
                  <li
                    key={index}
                    className={`my-2 p-2 max-w-xs text-sm rounded-md break-words ${
                      data.system
                        ? ""
                        : data.from === socketId
                        ? "bg-sky-600 self-end text-right ml-auto"
                        : "bg-gray-800 self-start text-left"
                    }`}
                  >
                    <strong>
                      {data.system
                        ? ""
                        : data.from === socketId
                        ? "Yo"
                        : data.user}
                      :
                    </strong>{" "}
                    {data.message}
                  </li>
                ))}
              </ul>
            </div>

            <form onSubmit={handleSubmit} className="flex">
              <input
                type="text"
                value={message}
                placeholder="Escribe tu mensaje..."
                onChange={(e) => setMessage(e.target.value)}
                className="border-2 border-zinc-500 p-2 flex-1 rounded-l-md bg-zinc-700 text-white"
              />
              <button
                type="submit"
                className="bg-sky-600 hover:bg-sky-500 p-2 rounded-r-md"
              >
                Enviar
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
