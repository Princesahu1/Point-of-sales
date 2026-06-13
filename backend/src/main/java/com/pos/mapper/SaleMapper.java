package com.pos.mapper;

import com.pos.dto.SaleItemDTO;
import com.pos.dto.SaleResponseDTO;
import com.pos.model.Sale;
import com.pos.model.SaleItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface SaleMapper {

    @Mapping(source = "cashier.username", target = "cashierUsername")
    @Mapping(source = "items", target = "items")
    SaleResponseDTO toResponseDTO(Sale sale);

    @Mapping(source = "product.id", target = "productId")
    @Mapping(source = "product.name", target = "productName")
    SaleItemDTO toSaleItemDTO(SaleItem saleItem);

    List<SaleItemDTO> toSaleItemDTOList(List<SaleItem> items);

    List<SaleResponseDTO> toResponseDTOList(List<Sale> sales);
}
