package com.pos.mapper;

import com.pos.dto.InventoryDTO;
import com.pos.model.InventoryItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface InventoryMapper {

    @Mapping(source = "product.id", target = "productId")
    @Mapping(source = "product.name", target = "productName")
    @Mapping(source = "product.barcode", target = "barcode")
    @Mapping(expression = "java(item.getQuantityOnHand() <= item.getReorderThreshold())", target = "belowThreshold")
    InventoryDTO toDTO(InventoryItem item);

    List<InventoryDTO> toDTOList(List<InventoryItem> items);

    @Mapping(target = "product", ignore = true)
    @Mapping(target = "lastUpdated", ignore = true)
    void updateEntityFromDTO(InventoryDTO inventoryDTO, @MappingTarget InventoryItem item);
}
