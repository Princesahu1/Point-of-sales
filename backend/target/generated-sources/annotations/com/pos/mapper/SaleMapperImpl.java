package com.pos.mapper;

import com.pos.dto.SaleItemDTO;
import com.pos.dto.SaleResponseDTO;
import com.pos.model.Product;
import com.pos.model.Sale;
import com.pos.model.SaleItem;
import com.pos.model.User;
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
public class SaleMapperImpl implements SaleMapper {

    @Override
    public SaleResponseDTO toResponseDTO(Sale sale) {
        if ( sale == null ) {
            return null;
        }

        SaleResponseDTO.SaleResponseDTOBuilder saleResponseDTO = SaleResponseDTO.builder();

        saleResponseDTO.cashierUsername( saleCashierUsername( sale ) );
        saleResponseDTO.items( toSaleItemDTOList( sale.getItems() ) );
        saleResponseDTO.id( sale.getId() );
        saleResponseDTO.totalAmount( sale.getTotalAmount() );
        saleResponseDTO.paymentMethod( sale.getPaymentMethod() );
        saleResponseDTO.status( sale.getStatus() );
        saleResponseDTO.createdAt( sale.getCreatedAt() );

        return saleResponseDTO.build();
    }

    @Override
    public SaleItemDTO toSaleItemDTO(SaleItem saleItem) {
        if ( saleItem == null ) {
            return null;
        }

        SaleItemDTO.SaleItemDTOBuilder saleItemDTO = SaleItemDTO.builder();

        saleItemDTO.productId( saleItemProductId( saleItem ) );
        saleItemDTO.productName( saleItemProductName( saleItem ) );
        saleItemDTO.id( saleItem.getId() );
        saleItemDTO.quantity( saleItem.getQuantity() );
        saleItemDTO.unitPrice( saleItem.getUnitPrice() );
        saleItemDTO.subtotal( saleItem.getSubtotal() );

        return saleItemDTO.build();
    }

    @Override
    public List<SaleItemDTO> toSaleItemDTOList(List<SaleItem> items) {
        if ( items == null ) {
            return null;
        }

        List<SaleItemDTO> list = new ArrayList<SaleItemDTO>( items.size() );
        for ( SaleItem saleItem : items ) {
            list.add( toSaleItemDTO( saleItem ) );
        }

        return list;
    }

    @Override
    public List<SaleResponseDTO> toResponseDTOList(List<Sale> sales) {
        if ( sales == null ) {
            return null;
        }

        List<SaleResponseDTO> list = new ArrayList<SaleResponseDTO>( sales.size() );
        for ( Sale sale : sales ) {
            list.add( toResponseDTO( sale ) );
        }

        return list;
    }

    private String saleCashierUsername(Sale sale) {
        if ( sale == null ) {
            return null;
        }
        User cashier = sale.getCashier();
        if ( cashier == null ) {
            return null;
        }
        String username = cashier.getUsername();
        if ( username == null ) {
            return null;
        }
        return username;
    }

    private Long saleItemProductId(SaleItem saleItem) {
        if ( saleItem == null ) {
            return null;
        }
        Product product = saleItem.getProduct();
        if ( product == null ) {
            return null;
        }
        Long id = product.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String saleItemProductName(SaleItem saleItem) {
        if ( saleItem == null ) {
            return null;
        }
        Product product = saleItem.getProduct();
        if ( product == null ) {
            return null;
        }
        String name = product.getName();
        if ( name == null ) {
            return null;
        }
        return name;
    }
}
