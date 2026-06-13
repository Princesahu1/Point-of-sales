package com.pos.service;

import com.pos.dto.AlertDTO;

import java.util.List;

public interface AlertService {

    List<AlertDTO> listUnresolvedAlerts();

    AlertDTO resolveAlert(Long alertId);
}
