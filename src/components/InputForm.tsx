import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import api from '../services/api'
import {
  ArrowCircleDown,
  ArrowCircleUp,
  PencilSimple,
  Trash,
} from '@phosphor-icons/react'

interface Task {
  id: number
  name: string
  cost: string
  deadline: string
}

export function Input() {
  const [taskName, setTaskName] = useState('')
  const [cost, setCost] = useState('')
  const [deadline, setDeadline] = useState('')
  const [tasks, setTasks] = useState<Task[]>([])
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null)

  const baseUrl = 'https://api-tasks-list.onrender.com'

  async function getTasks() {
    const response = await api.get(`${baseUrl}/tarefas`)
    setTasks(response.data)
  }

  async function handleCreateTask() {
    await api.post(`${baseUrl}/tarefas`, {
      name: taskName,
      cost: Number.parseFloat(cost),
      deadline,
    })
    getTasks()
    clearForm()
  }

  async function handleDeleteTask(id: number) {
    if (window.confirm('Tem certeza de que deseja deletar esta tarefa?')) {
      await api.delete(`${baseUrl}/tarefas/${id}`)
      getTasks()
    }
  }

  async function handleEditTask() {
    if (editingTaskId) {
      await api.put(`${baseUrl}/tarefas/${editingTaskId}`, {
        name: taskName,
        cost: Number.parseFloat(cost),
        deadline,
      })
      getTasks()
      clearForm()
    }
  }

  const clearForm = () => {
    setTaskName('')
    setCost('')
    setDeadline('')
    setEditingTaskId(null)
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    getTasks()
  }, [])

  const handleEdit = (task: Task) => {
    setTaskName(task.name)
    setCost(task.cost)
    setDeadline(task.deadline)
    setEditingTaskId(task.id)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    editingTaskId ? await handleEditTask() : await handleCreateTask()
  }

  const handleMove = (id: number, direction: 'up' | 'down') => {
    const index = tasks.findIndex(task => task.id === id)
    const newTasks = [...tasks]
    const [movedTask] = newTasks.splice(index, 1)
    const newIndex = direction === 'up' ? index - 1 : index + 1
    newTasks.splice(newIndex, 0, movedTask)
    setTasks(newTasks)
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-900 text-gray-300 p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-semibold text-gray-100 mb-4">
          {editingTaskId ? 'Editar Atividade' : 'Inserir Atividade'}
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="taskName"
              className="block text-gray-400 font-medium"
            >
              Nome da Tarefa
            </label>
            <input
              type="text"
              id="taskName"
              value={taskName}
              onChange={e => setTaskName(e.target.value)}
              className="w-full mt-1 p-2 border border-gray-700 bg-gray-700 text-gray-200 rounded-md focus:outline-none focus:border-indigo-500"
              placeholder="Digite o nome da tarefa"
              required
            />
          </div>
          <div>
            <label htmlFor="cost" className="block text-gray-400 font-medium">
              Custo (R$)
            </label>
            <input
              type="number"
              id="cost"
              value={cost}
              onChange={e => setCost(e.target.value)}
              className="w-full mt-1 p-2 border border-gray-700 bg-gray-700 text-gray-200 rounded-md focus:outline-none focus:border-indigo-500"
              placeholder="Digite o custo em R$"
              required
            />
          </div>
          <div>
            <label
              htmlFor="deadline"
              className="block text-gray-400 font-medium"
            >
              Data Limite
            </label>
            <input
              type="date"
              id="deadline"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="w-full mt-1 p-2 border border-gray-700 bg-gray-700 text-gray-200 rounded-md focus:outline-none focus:border-indigo-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-zinc-900 text-gray-200 font-medium py-2 rounded-md hover:bg-zinc-800 transition duration-300"
          >
            {editingTaskId ? 'Atualizar Tarefa' : 'Adicionar Tarefa'}
          </button>
        </form>
      </div>

      <div className="mt-8 w-full max-w-md">
        <h3 className="text-xl font-semibold text-gray-100 mb-4">
          Tarefas Inseridas
        </h3>
        {tasks.length > 0 ? (
          <ul className="space-y-4">
            {tasks.map(task => (
              <li
                key={task.id}
                className={`p-4 rounded-lg shadow-md flex justify-between items-center ${
                  Number.parseFloat(task.cost) >= 1000
                    ? 'bg-blue-950 text-gray-100'
                    : 'bg-gray-800'
                }`}
              >
                <div>
                  <h4 className="text-lg font-semibold text-indigo-400">
                    {task.name}
                  </h4>
                  <p className="text-gray-400">Custo: R$ {task.cost}</p>
                  <p className="text-gray-400">
                    Data Limite: {format(new Date(task.deadline), 'dd/MM/yyyy')}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(task)}
                    className="bg-zinc-900 text-gray-200 px-3 py-1 rounded hover:bg-zinc-600 transition duration-300"
                  >
                    <PencilSimple />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteTask(task.id)}
                    className="bg-zinc-900 text-gray-200 px-3 py-1 rounded hover:bg-zinc-600 transition duration-300"
                  >
                    <Trash />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(task.id, 'up')}
                    className="bg-zinc-900 text-gray-200 px-2 py-1 rounded hover:bg-zinc-600 transition duration-300"
                    disabled={tasks[0].id === task.id}
                  >
                    <ArrowCircleUp />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(task.id, 'down')}
                    className="bg-zinc-900 text-gray-200 px-2 py-1 rounded hover:bg-zinc-600 transition duration-300"
                    disabled={tasks[tasks.length - 1].id === task.id}
                  >
                    <ArrowCircleDown />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">Nenhuma tarefa inserida ainda.</p>
        )}
      </div>
    </div>
  )
}
