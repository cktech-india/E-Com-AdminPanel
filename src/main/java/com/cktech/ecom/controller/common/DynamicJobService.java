package com.cktech.ecom.controller.common;

import com.cktech.ecom.model.product.StockNotifyDTO;
import com.cktech.ecom.repository.StockNotifyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.support.CronTrigger;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledFuture;

@Service
public class DynamicJobService {

    @Autowired
    private TaskScheduler taskScheduler;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private StockNotifyRepository stockNotifyRepository;



    @Autowired
    private com.cktech.ecom.service.communication.NotificationService notificationService;

    @Value("${stock.notify.cron:0 */5 * * * *}")
    private String cronExpression;

    // To keep track of scheduled tasks so we can cancel them
    private final Map<Long, ScheduledFuture<?>> scheduledTasks = new ConcurrentHashMap<>();

    @jakarta.annotation.PostConstruct
    public void init() {
        refreshConfiguration();
    }

    // 1. Logic to execute based on type
    public void executeTask() {
        try {
            List<StockNotifyDTO> configs = stockNotifyRepository.findByIsDeletedFalse();
            List<String> emailList = configs.stream()
                    .map(StockNotifyDTO::getEmailId)
                    .filter(Objects::nonNull)
                    .toList();

            if (!emailList.isEmpty()) {
                java.util.Map<String, Object> input = new java.util.HashMap<>();
                input.put("emailTo", String.join(",", emailList));
                notificationService.trigger(input, "STOCK_ALERT", "SYSTEM", "default", "EMAIL");
                stockNotifyRepository.deleteAll();
            }

            System.out.println("Sending Notification for ID via NotificationService");

        } catch (Exception e) {
            System.err.println("Error executing dynamic job task: " + e.getMessage());
        }
    }

    // 2. Refresh logic: Clear and Reschedule
    public void refreshConfiguration() {
        // Cancel all existing tasks
        scheduledTasks.forEach((id, future) -> future.cancel(true));
        scheduledTasks.clear();

        ScheduledFuture<?> future = taskScheduler.schedule(
                () -> executeTask(),
                new CronTrigger(cronExpression)
        );
        scheduledTasks.put(1L, future);
    }
}