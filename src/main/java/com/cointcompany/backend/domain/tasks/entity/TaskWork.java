package com.cointcompany.backend.domain.tasks.entity;

import com.cointcompany.backend.domain.common.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Where(clause = "del = false")
@SQLDelete(sql = "UPDATE task_work SET del = true WHERE id_num = ?")
public class TaskWork extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long idNum;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "taskId")
    private Tasks task;

    private Long workTime;

    private String type;

    @Column(columnDefinition = "TEXT")
    private String description;

    private boolean del = Boolean.FALSE;

    public static TaskWork of(Tasks task, Long workTime, String type, String description) {
        return TaskWork.builder()
                .task(task)
                .workTime(workTime)
                .type(type)
                .description(description)
                .del(false)
                .build();
    }

    @Builder
    public TaskWork(Tasks task, Long workTime, String type, String description, Boolean del) {
        this.task = task;
        this.workTime = workTime;
        this.type = type;
        this.description = description;
        this.del = del;
    }
}
