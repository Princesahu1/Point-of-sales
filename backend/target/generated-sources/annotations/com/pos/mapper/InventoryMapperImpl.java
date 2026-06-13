package com.pos.mapper;

import com.pos.dto.InventoryDTO;
import com.pos.model.InventoryItem;
import com.pos.model.Product;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-06-13T17:39:06+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.17 (Eclipse Adoptium)"
)
@Component
public class InventoryMapperImpl implements InventoryMapper {

    @Override
    public InventoryDTO toDTO(InventoryItem item) {
        if ( item == null ) {
            return null;
        }

        InventoryDTO.InventoryDTOBuilder inventoryDTO = InventoryDTO.builder();

        inventoryDTO.productId( itemProductId( item ) );
        inventoryDTO.productName( itemProductName( item ) );
        inventoryDTO.barcode( itemProductBarcode( item ) );
        inventoryDTO.id( item.getId() );
        inventoryDTO.quantityOnHand( item.getQuantityOnHand() );
        inventoryDTO.reorderThreshold( item.getReorderThreshold() );
        inventoryDTO.lastUpdated( item.getLastUpdated() );

        inventoryDTO.belowThreshold( item.getQuantityOnHand() <= item.getReorderThreshold() );

        return inventoryDTO.build();
    }

    @Override
    public List<InventoryDTO> toDTOList(List<InventoryItem> items) {
        if ( items == null ) {
            return null;
        }

        List<InventoryDTO> list = new ArrayList<InventoryDTO>( items.size() );
        for ( InventoryItem inventoryItem : items ) {
            list.add( toDTO( inventoryItem ) );
        }

        return list;
    }

    @Override
    public void updateEntityFromDTO(InventoryDTO inventoryDTO, InventoryItem item) {
        if ( inventoryDTO == null ) {
            return;
        }

        item.setId( inventoryDTO.getId() );
        item.setQuantityOnHand( inventoryDTO.getQuantityOnHand() );
        item.setReorderThreshold( inventoryDTO.getReorderThreshold() );
    }

    private Long itemProductId(InventoryItem inventoryItem) {
        if ( inventoryItem == null ) {
            return null;
        }
        Product product = inventoryItem.getProduct();
        if ( product == null ) {
            return null;
        }
        Long id = product.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String itemProductName(InventoryItem inventoryItem) {
        if ( inventoryItem == null ) {
            return null;
        }
        Product product = inventoryItem.getProduct();
        if ( product == null ) {
            return null;
        }
        String name = product.getName();
        if ( name == null ) {
            return null;
        }
        return name;
    }

    private String itemProductBarcode(InventoryItem inventoryItem) {
        if ( inventoryItem == null ) {
            return null;
        }
        Product product = inventoryItem.getProduct();
        if ( product == null ) {
            return null;
        }
        String barcode = product.getBarcode();
        if ( barcode == null ) {
            return null;
        }
        return barcode;
    }
}
