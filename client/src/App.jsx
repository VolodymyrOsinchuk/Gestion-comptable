import { useState, useEffect } from "react";
import { getTasks, createTask, deleteTask } from "./api";

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await createTask({ title, description });
      setTitle("");
      setDescription("");
      await loadTasks();
    } catch (error) {
      console.error("Erreur:", error);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      await loadTasks();
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h2>Gestionnaire de tâches</h2>

      {/* Formulaire */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Titre de la tâche"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />

        <button
          type="submit"
          style={{
            padding: "10px 20px",
            cursor: "pointer",
            marginBottom: "20px",
          }}
        >
          {loading ? "Ajout..." : "Ajouter"}
        </button>
      </form>

      {/* Liste des tâches */}
      <div>
        {tasks.map((task) => (
          <div
            key={task.id}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "5px",
            }}
          >
            <h3>{task.title}</h3>
            <p>{task.description}</p>

            <button
              onClick={() => handleDelete(task.id)}
              style={{ padding: "5px 15px", cursor: "pointer" }}
            >
              Supprimer
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
