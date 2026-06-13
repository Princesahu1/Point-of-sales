package com.pos.mapper;

import com.pos.dto.AlertDTO;
import com.pos.model.ReplenishmentAlert;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface AlertMapper {

    @Mapping(source = "inventoryItem.id", target = "inventoryItemId")
    @Mapping(source = "inventoryItem.product.name", target = "productName")
    @Mapping(source = "inventoryItem.product.barcode", target = "barcode")
    @Mapping(source = "inventoryItem.quantityOnHand", target = "currentQuantity")
    @Mapping(source = "inventoryItem.reorderThreshold", target = "reorderThreshold")
    AlertDTO toDTO(ReplenishmentAlert alert);

    List<AlertDTO> toDTOList(List<ReplenishmentAlert> alerts);
}
