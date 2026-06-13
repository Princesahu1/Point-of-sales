package com.pos.serviceImpl;

import com.pos.dto.AlertDTO;
import com.pos.exception.ResourceNotFoundException;
import com.pos.mapper.AlertMapper;
import com.pos.model.ReplenishmentAlert;
import com.pos.repository.ReplenishmentAlertRepository;
import com.pos.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AlertServiceImpl implements AlertService {

    private final ReplenishmentAlertRepository alertRepository;
    private final AlertMapper alertMapper;

    @Override
    @Transactional(readOnly = true)
    public List<AlertDTO> listUnresolvedAlerts() {
        return alertMapper.toDTOList(alertRepository.findByResolvedFalse());
    }

    @Override
    public AlertDTO resolveAlert(Long alertId) {
        ReplenishmentAlert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found with ID: " + alertId));
        alert.setResolved(true);
        ReplenishmentAlert saved = alertRepository.save(alert);
        return alertMapper.toDTO(saved);
    }
}
