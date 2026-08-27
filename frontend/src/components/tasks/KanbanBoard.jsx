import { useState } from "react";

import { FiPlus } from "react-icons/fi";

import Badge from "../ui/Badge";

import Avatar from "../ui/Avatar";

import Modal from "../ui/Modal";

import { TASK_COLUMNS, getPriorityBadge } from "../../data/mockData";

import { getUserById } from "../../services/storage";



const TaskCard = ({ task, onDragStart, onClick }) => {

  const assignee = task.assigneeId ? getUserById(task.assigneeId) : null;

  return (

    <div

      draggable

      onDragStart={(e) => onDragStart(e, task.id)}

      onClick={() => onClick(task)}

      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3.5 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"

    >

      <div className="flex items-start justify-between gap-2">

        <p className="text-sm font-medium text-slate-900 dark:text-white">{task.title}</p>

        <Badge className={getPriorityBadge(task.priority)}>{task.priority}</Badge>

      </div>

      {task.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{task.description}</p>}

      <div className="mt-3 flex items-center justify-between">

        {assignee ? <Avatar src={assignee.avatar} name={assignee.name} size="sm" /> : <span className="text-xs text-slate-400">Unassigned</span>}

        {task.dueDate && <span className="text-xs text-slate-400">{new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>}

      </div>

    </div>

  );

};



const KanbanBoard = ({ tasks, onMoveTask, onAddTask, onEditTask, canEdit = true }) => {

  const [showAdd, setShowAdd] = useState(false);

  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "medium", status: "todo" });

  const [editTask, setEditTask] = useState(null);

  const [dragOver, setDragOver] = useState(null);



  const handleDrop = (e, status) => {

    e.preventDefault();

    setDragOver(null);

    const taskId = e.dataTransfer.getData("taskId");

    if (taskId) onMoveTask(taskId, status);

  };



  const handleAdd = (e) => {

    e.preventDefault();

    if (!newTask.title.trim()) return;

    onAddTask(newTask);

    setNewTask({ title: "", description: "", priority: "medium", status: "todo" });

    setShowAdd(false);

  };



  return (

    <>

      <div className="flex gap-4 overflow-x-auto pb-4">

        {TASK_COLUMNS.map((col) => {

          const colTasks = tasks.filter((t) => t.status === col.id);

          const isOver = dragOver === col.id;

          return (

            <div key={col.id} className="flex-shrink-0 w-72">

              <div className="flex items-center gap-2 mb-3">

                <span className={`w-2.5 h-2.5 rounded-full ${col.color}`} />

                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{col.label}</h3>

                <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{colTasks.length}</span>

              </div>

              <div

                onDragOver={(e) => { e.preventDefault(); setDragOver(col.id); }}

                onDragLeave={() => setDragOver(null)}

                onDrop={(e) => handleDrop(e, col.id)}

                className={`space-y-2.5 min-h-[200px] rounded-xl p-2.5 border-2 transition-all duration-200 ${

                  isOver

                    ? "bg-brand-50 dark:bg-brand-500/10 border-brand-400 border-dashed scale-[1.01]"

                    : "bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800"

                }`}

              >

                {colTasks.map((task) => (

                  <TaskCard

                    key={task.id}

                    task={task}

                    onDragStart={(e, id) => e.dataTransfer.setData("taskId", id)}

                    onClick={canEdit ? setEditTask : () => {}}

                  />

                ))}

                {isOver && colTasks.length === 0 && (

                  <p className="text-xs text-brand-500 text-center py-8 font-medium">Drop task here</p>

                )}

              </div>

            </div>

          );

        })}

      </div>



      {canEdit && (

        <button onClick={() => setShowAdd(true)} className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700">

          <FiPlus size={16} /> Add Task

        </button>

      )}



      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Task">

        <form onSubmit={handleAdd} className="space-y-4">

          <input required placeholder="Task title" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}

            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-brand-500" />

          <textarea placeholder="Description" rows={3} value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}

            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-brand-500 resize-none" />

          <select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}

            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">

            <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>

          </select>

          <select value={newTask.status} onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}

            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">

            {TASK_COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}

          </select>

          <button type="submit" className="w-full bg-brand-600 text-white font-semibold py-2.5 rounded-xl hover:bg-brand-700">Create Task</button>

        </form>

      </Modal>



      {editTask && (

        <Modal open={!!editTask} onClose={() => setEditTask(null)} title="Edit Task">

          <form onSubmit={(e) => { e.preventDefault(); onEditTask(editTask); setEditTask(null); }} className="space-y-4">

            <input value={editTask.title} onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}

              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" />

            <textarea rows={3} value={editTask.description} onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}

              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 resize-none" />

            <select value={editTask.status} onChange={(e) => setEditTask({ ...editTask, status: e.target.value })}

              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">

              {TASK_COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}

            </select>

            <button type="submit" className="w-full bg-brand-600 text-white font-semibold py-2.5 rounded-xl">Save Changes</button>

          </form>

        </Modal>

      )}

    </>

  );

};



export default KanbanBoard;

