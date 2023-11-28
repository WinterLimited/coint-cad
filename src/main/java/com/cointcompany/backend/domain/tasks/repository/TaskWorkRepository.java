package com.cointcompany.backend.domain.tasks.repository;

import com.cointcompany.backend.domain.tasks.entity.TaskWork;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskWorkRepository extends JpaRepository<TaskWork, Long> {

    // findTaskWorkByTasks_IdNum
    List<TaskWork> findTaskWorkByTask_IdNum(Long taskId);
}
