import React from 'react';
import {
  AsyncStorage,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { TaskItem } from '../components/TaskItem';
import { API_URL } from '../constants/General';

export default class CompletedScreen extends React.Component {
  static navigationOptions = {
    title: 'Completed',
  };

  constructor(props) {
    super(props);

    this.updateTask = this.updateTask.bind(this);
    this.deleteTask = this.deleteTask.bind(this);

    this.state = {
      tasks: [],
      showEditWindow: false,
      currentTaskIndex: 0,
      currentTaskTitle: "",
      currentTaskContent: "",
    };
  }

  async componentDidMount() {
    const token = await AsyncStorage.getItem('userToken');
    const res = await fetch(`${API_URL}/tasks`, {
      method: 'GET',
      headers: {
        'Authorization': token,
      }})
      .then(res => res.json());
    // This converts response object into an array that 
    // can be read by FlatList
    const data = res ? Object.values(res) : [];
    
    this.setState({ tasks: data });
  }

  async updateTask(task) {
    const token = await AsyncStorage.getItem('userToken');
    const result = await fetch(`${API_URL}/tasks/${task.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify(task),
    });

    return result.json();
  }

  async deleteTask(task) {
    const token = await AsyncStorage.getItem('userToken');
    await fetch(`${API_URL}/tasks/${task.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token,
      },
    });
  }

  onItemClicked = (index) => {
    this.setState({
      showEditWindow: true,
      currentTaskIndex: index,
      currentTaskTitle: this.state.tasks[index].title,
      currentTaskContent: this.state.tasks[index].content,
    });
  }

  onCancelClicked = () => {
    this.setState({showEditWindow: false});
  }

  onFinishClicked = () => {
    let tasks = [...this.state.tasks];

    if (this.state.currentTaskTitle !== "") {
      if (this.state.newTask) {
        this.createTask(this.state.currentTaskTitle, this.state.currentTaskContent).then((newTask) => {
          tasks.push(newTask);
          this.setState({tasks});
        });
      } else {
        let currentTask = tasks[this.state.currentTaskIndex];
        currentTask.title = this.state.currentTaskTitle;
        currentTask.content = this.state.currentTaskContent;

        this.setState({tasks});
        this.updateTask(currentTask);
      }
    } else if (!this.state.newTask) {
      const currentTask = tasks[this.state.currentTaskIndex];
      tasks.splice(this.state.currentTaskIndex, 1);

      this.setState({tasks});
      this.deleteTask(currentTask);
    }

    this.setState({showEditWindow: false});
  }

  onTaskCheckedChange = (index) => {
    let tasks = [...this.state.tasks];
    let currentTask = tasks[index];

    currentTask.completed = !currentTask.completed;

    this.setState({tasks});
    this.updateTask(currentTask);
  }

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          data={this.state.tasks}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item, index}) => (
            <TaskItem
              task={item}
              onClick={() => this.onItemClicked(index)}
              onCheckedChange={() => this.onTaskCheckedChange(index)}
            />
          )}
        />

        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.showEditWindow}
          onRequestClose={() => this.setState({showEditWindow: false})}>

          <View style={styles.modalContainer}>
            <View style={styles.row}>
              <TouchableOpacity onPress={this.onCancelClicked}>
                <Text style={styles.taskModalButton}>Cancel</Text>
              </TouchableOpacity>

              <Text style={styles.currentTaskHeader}>
                {this.state.newTask ? "New Task" : "Edit Task"}
              </Text>

              <TouchableOpacity onPress={this.onFinishClicked}>
                <Text style={styles.taskModalButton}>Finish</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.textInput}
              placeholder="Title"
              value={this.state.currentTaskTitle}
              onChangeText={this.onTaskTitleChange}/>

            <TextInput
              style={styles.textInput}
              placeholder="Content"
              value={this.state.currentTaskContent}
              onChangeText={this.onTaskContentChange}/>
          </View>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalContainer: {
    margin: 15,
  },
  currentTaskHeader: {
    fontSize: 24,
  },
  textInput: {
    marginTop: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taskModalButton: {
    fontSize: 24,
    color: "#2F95DC",
  },
});
