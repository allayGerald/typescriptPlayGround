import {Project, ProjectStatus} from '../models/project'
import {ProjectItem} from './project-item'
import {DragTarget} from '../models/drag-drop'
import {Component} from './base-component'
import {projectState} from '../state/project-state'
import {autoBind} from '../decorators/autobind'

export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
    assignedProjects: Project[];

    constructor(private type: 'active' | 'finished') {
      super('project-list', 'app', false, `${type}-projects`);
      this.assignedProjects = [];

      this.configure();
      this.renderContent();
    }

    @autoBind
    dragOverHandler(event: DragEvent) {
      if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
        event.preventDefault();
        const listEl = this.element.querySelector('ul')!;
        listEl.classList.add('droppable');
      }
    }

    @autoBind
    dragLeaveHandler(_: DragEvent) {
      const listEl = this.element.querySelector('ul')!;
      listEl.classList.remove('droppable');
    }

    @autoBind
    dropHandler(event: DragEvent) {
      const prjId = event.dataTransfer!.getData('text/plain');

      projectState.moveProject(prjId, this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished);
    }

    renderProjects() {
      const listEl = document.getElementById(`${this.type}-project-list`)! as HTMLUListElement;

      listEl.innerHTML = ''; // clear before appending
      for (const prjItem of this.assignedProjects) {
        new ProjectItem(this.element.querySelector('ul')!.id, prjItem);
      }
    }

    configure() {
      this.element.addEventListener('dragleave', this.dragLeaveHandler);
      this.element.addEventListener('dragover', this.dragOverHandler);
      this.element.addEventListener('drop', this.dropHandler);

      projectState.addListener((projects: Project[]) => {
        this.assignedProjects = projects.filter(prj => {
          if (this.type === 'active') {
            return prj.status === ProjectStatus.Active;
          }
          return prj.status === ProjectStatus.Finished;
        });

        this.renderProjects();
      });
    }

    renderContent() {
      this.element.querySelector('ul')!.id = `${this.type}-project-list`;
      this.element.querySelector('h2')!.textContent = `${this.type.toUpperCase()} PROJECTS`;
    }
  }
