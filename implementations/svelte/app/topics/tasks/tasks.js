const component = require('./tasks.html')
const model = require('model.js')
const all = require('async-all')

const UUID_V4_REGEX = '[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}'

module.exports = function(stateRouter) {
	stateRouter.addState({
		name: 'app.topics.tasks',
		route: '/:topicId(' + UUID_V4_REGEX + ')',
 		template: {
 			component,
 			options: {
 				methods: {
	 				setTaskDone(index, done) {
	 					const topicId = this.get('topicId')
		 				const tasks = this.get('tasks').slice()
		 				tasks[index].done = done

		 				this.set({ tasks })

		 				model.saveTasks(topicId, tasks)
	 				},
	 				remove(taskIndex) {
	 					const topicId = this.get('topicId')
		 				const tasksWithIndexElementRemoved = this.get('tasks').slice()

		 				tasksWithIndexElementRemoved.splice(taskIndex, 1)

		 				this.set({
		 					tasks: tasksWithIndexElementRemoved
		 				})

		 				model.saveTasks(topicId, tasksWithIndexElementRemoved)
		 			}
 				}
 			}
 		},
 		resolve: function(data, parameters, cb) {
 			all({
 				topic: model.getTopic.bind(null, parameters.topicId),
 				tasks: model.getTasks.bind(null, parameters.topicId),
 				topicId: parameters.topicId
 			}, cb)
 		},
 		activate: function(context) {
 			const svelte = context.domApi
 			const topicId = context.parameters.topicId

 			svelte.on('newTaskKeyup', function(e) {
 				const newTaskName = svelte.get('newTaskName')
 				if (e.keyCode === 13 && newTaskName) {
 					createNewTask(newTaskName)
 					svelte.set({
 						newTaskName: ''
 					})
 				}
 			})

 			function createNewTask(taskName) {
 				const task = model.saveTask(topicId, taskName)
 				const newTasks = svelte.get('tasks').concat(task)
 				svelte.set({
 					tasks: newTasks
 				})
 			}

 			svelte.mountedToTarget.querySelector('.add-new-task').focus()
 		}
	})

	stateRouter.addState({
		name: 'app.topics.no-task',
		route: '',
 		template: require('./no-task-selected.html')
	})
}