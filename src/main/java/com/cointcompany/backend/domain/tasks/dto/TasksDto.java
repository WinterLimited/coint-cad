package com.cointcompany.backend.domain.tasks.dto;

import com.cointcompany.backend.domain.projects.dto.ProjectsDto;
import com.cointcompany.backend.domain.projects.entity.Projects;
import com.cointcompany.backend.domain.tasks.entity.TaskGroup;
import com.cointcompany.backend.domain.tasks.entity.Tasks;
import lombok.*;

import java.util.List;
import java.util.stream.Collectors;

@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString
@Getter
@Setter
public class TasksDto {

    @NoArgsConstructor
    @Data
    public static class TasksDepartmentDto {
        private Long taskId;
        private Long departmentId;
        private String role;

        public TasksDepartmentDto (Long taskId, Long departmentId, String role) {
            this.taskId = taskId;
            this.departmentId = departmentId;
            this.role = role;
        }
    }
    @NoArgsConstructor
    @Data
    public static class TaskUserDto {
        private Long taskId;
        private Long userId;
        private Integer taskRoleId;

        public TaskUserDto (Long taskId, Long userId, Integer taskRoleId) {
            this.taskId = taskId;
            this.userId = userId;
            this.taskRoleId = taskRoleId;
        }
    }

    @NoArgsConstructor
    @Data
    public static class TaskTagDto {
        private Long taskId;
        private String tagName;

        public TaskTagDto (Long taskId, String tagName) {
            this.taskId = taskId;
            this.tagName = tagName;
        }
    }

    @NoArgsConstructor
    @Data
    public static class TaskGroupPostDto {
        private String taskGroupName;
        private String description;
        private Long projectsIdNum;

        public TaskGroupPostDto (String taskGroupName, String description, Long projectsIdNum) {
            this.taskGroupName = taskGroupName;
            this.description = description;
            this.projectsIdNum = projectsIdNum;
        }
    }

    @NoArgsConstructor
    @Data
    public static class TaskGroupDto {
        private Long idNum;
        private String taskGroupName;
        private String description;
        private Long projectsIdNum;

        public TaskGroupDto (TaskGroup taskGroup) {
            this.idNum = taskGroup.getIdNum();
            this.taskGroupName = taskGroup.getTaskGroupName();
            this.description = taskGroup.getDescription();
            this.projectsIdNum = taskGroup.getProjects().getIdNum();
        }
    }

    @NoArgsConstructor
    @Data
    public static class TaskGrouping {
        private Long idNum;
        private Long taskGroupIdNum;

        public TaskGrouping (Long idNum, Long taskGroupIdNum) {
            this.idNum = idNum;
            this.taskGroupIdNum = taskGroupIdNum;
        }
    }

    @NoArgsConstructor
    @Data
    public static class GetTaskRes {
        private Long idNum;

        private String taskName;

        private String description;

        private String startDate;

        private String endDate;

        private String status;

        private String regDate;

        private String regUserid;

        private String projectName;

        private Long taskGroupIdNum;

        public GetTaskRes (Tasks tasks) {

            this.idNum = tasks.getIdNum();
            this.taskName = tasks.getTaskName();
            this.description = tasks.getDescription();
            this.startDate = String.valueOf(tasks.getStartDate());
            this.endDate = String.valueOf(tasks.getEndDate());
            this.status = tasks.getStatus();
            this.regDate = String.valueOf(tasks.getRegDate());
            this.regUserid = String.valueOf(tasks.getRegUserid());
            this.projectName = tasks.getProjects().getProjectName();
            if (tasks.getTaskGroup() != null) {
                this.taskGroupIdNum = tasks.getTaskGroup().getIdNum();
            } else {
                this.taskGroupIdNum = null;
            }

        }
    }

    @NoArgsConstructor
    @Data
    public static class GetTaskInfo {
        private Long idNum;

        private String taskName;

        private String description;

        private String startDate;

        private String endDate;

        private String status;

        private String regDate;

        private String regUserid;

        private String projectName;

        private Long taskGroupIdNum;

        private Long projectsIdNum;

        public GetTaskInfo (Tasks tasks) {

            this.idNum = tasks.getIdNum();
            this.taskName = tasks.getTaskName();
            this.description = tasks.getDescription();
            this.startDate = String.valueOf(tasks.getStartDate());
            this.endDate = String.valueOf(tasks.getEndDate());
            this.status = tasks.getStatus();
            this.regDate = String.valueOf(tasks.getRegDate());
            this.regUserid = String.valueOf(tasks.getRegUserid());
            this.projectName = tasks.getProjects().getProjectName();
            if (tasks.getTaskGroup() != null) {
                this.taskGroupIdNum = tasks.getTaskGroup().getIdNum();
            } else {
                this.taskGroupIdNum = null;
            }
            this.projectsIdNum = tasks.getProjects().getIdNum();

        }
    }

    @NoArgsConstructor
    @Data
    public static class GetGroupTask {
        private Long idNum;

        private String taskName;

        private Long projectsIdNum;

        private Long taskGroupIdNum;

        public GetGroupTask (Tasks tasks) {

            this.idNum = tasks.getIdNum();
            this.taskName = tasks.getTaskName();
            this.projectsIdNum = tasks.getProjects().getIdNum();
            if (tasks.getTaskGroup() != null) {
                this.taskGroupIdNum = tasks.getTaskGroup().getIdNum();
            } else {
                this.taskGroupIdNum = null;
            }

        }

    }
    @NoArgsConstructor
    @Data
    public static class PostTaskReq {

        private String taskName;

        private String description;

        private String startDate;

        private String endDate;

        private String status;

        public PostTaskReq (Tasks tasks) {

            this.taskName = tasks.getTaskName();
            this.description = tasks.getDescription();
            this.startDate = String.valueOf(tasks.getStartDate());
            this.endDate = String.valueOf(tasks.getEndDate());
            this.status = tasks.getStatus();
        }
    }
    @NoArgsConstructor
    @Data
    public static class TaskStatus {
        private Long idNum;
        private String status;

        public TaskStatus (Long idNum, String status) {
            this.idNum = idNum;
            this.status = status;
        }
    }

}
