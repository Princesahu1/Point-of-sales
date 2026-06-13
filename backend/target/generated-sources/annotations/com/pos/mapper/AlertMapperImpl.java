package com.pos.mapper;

import com.pos.dto.AlertDTO;
import com.pos.model.InventoryItem;
import com.pos.model.Product;
import com.pos.model.ReplenishmentAlert;
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
public class AlertMapperImpl implements AlertMapper {

    @Override
    public AlertDTO toDTO(ReplenishmentAlert alert) {
        if ( alert == null ) {
            return null;
        }

        AlertDTO.AlertDTOBuilder alertDTO = AlertDTO.builder();

        alertDTO.inventoryItemId( alertInventoryItemId( alert ) );
        alertDTO.productName( alertInventoryItemProductName( alert ) );
        alertDTO.barcode( alertInventoryItemProductBarcode( alert ) );
        alertDTO.currentQuantity( alertInventoryItemQuantityOnHand( alert ) );
        alertDTO.reorderThreshold( alertInventoryItemReorderThreshold( alert ) );
        alertDTO.id( alert.getId() );
        alertDTO.alertedAt( alert.getAlertedAt() );
        alertDTO.resolved( alert.isResolved() );

        return alertDTO.build();
    }

    @Override
    public List<AlertDTO> toDTOList(List<ReplenishmentAlert> alerts) {
        if ( alerts == null ) {
            return null;
        }

        List<AlertDTO> list = new ArrayList<AlertDTO>( alerts.size() );
        for ( ReplenishmentAlert replenishmentAlert : alerts ) {
            list.add( toDTO( replenishmentAlert ) );
        }

        return list;
    }

    private Long alertInventoryItemId(ReplenishmentAlert replenishmentAlert) {
        if ( replenishmentAlert == null ) {
            return null;
        }
        InventoryItem inventoryItem = replenishmentAlert.getInventoryItem();
        if ( inventoryItem == null ) {
            return null;
        }
        Long id = inventoryItem.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String alertInventoryItemProductName(ReplenishmentAlert replenishmentAlert) {
        if ( replenishmentAlert == null ) {
            return null;
        }
        InventoryItem inventoryItem = replenishmentAlert.getInventoryItem();
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

    private String alertInventoryItemProductBarcode(ReplenishmentAlert replenishmentAlert) {
        if ( replenishmentAlert == null ) {
            return null;
        }
        InventoryItem inventoryItem = replenishmentAlert.getInventoryItem();
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

    private Integer alertInventoryItemQuantityOnHand(ReplenishmentAlert replenishmentAlert) {
        if ( replenishmentAlert == null ) {
            return null;
        }
        InventoryItem inventoryItem = replenishmentAlert.getInventoryItem();
        if ( inventoryItem == null ) {
            return null;
        }
        Integer quantityOnHand = inventoryItem.getQuantityOnHand();
        if ( quantityOnHand == null ) {
            return null;
        }
        return quantityOnHand;
    }

    private Integer alertInventoryItemReorderThreshold(ReplenishmentAlert replenishmentAlert) {
        if ( replenishmentAlert == null ) {
            return null;
        }
        InventoryItem inventoryItem = replenishmentAlert.getInventoryItem();
        if ( inventoryItem == null ) {
            return null;
        }
        Integer reorderThreshold = inventoryItem.getReorderThreshold();
        if ( reorderThreshold == null ) {
            return null;
        }
        return reorderThreshold;
    }
}
