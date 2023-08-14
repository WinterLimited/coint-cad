package com.cointcompany.backend.domain.tasks.dto;

import com.cointcompany.backend.domain.projects.dto.ProjectsDto;
import com.cointcompany.backend.domain.projects.entity.Projects;
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
        private String role;

        public TaskUserDto (Long taskId, Long userId, String role) {
            this.taskId = taskId;
            this.userId = userId;
            this.role = role;
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

}
