package com.depositourbano.android.ui.spaces

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.depositourbano.android.data.models.SpaceSearchParams
import com.depositourbano.android.data.models.SpaceType
import com.depositourbano.android.utils.Constants

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SpaceFiltersSheet(
    onDismiss: () -> Unit,
    onApplyFilters: (SpaceSearchParams) -> Unit
) {
    var selectedType by remember { mutableStateOf<SpaceType?>(null) }
    var minPrice by remember { mutableStateOf("") }
    var maxPrice by remember { mutableStateOf("") }
    var minSize by remember { mutableStateOf("") }
    var maxSize by remember { mutableStateOf("") }
    var selectedFeatures by remember { mutableStateOf(setOf<String>()) }
    
    ModalBottomSheet(
        onDismissRequest = onDismiss,
        modifier = Modifier.fillMaxHeight(0.9f)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp)
                .verticalScroll(rememberScrollState())
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Filtros",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold
                )
                IconButton(onClick = onDismiss) {
                    Icon(Icons.Default.Close, contentDescription = "Close")
                }
            }
            
            Spacer(modifier = Modifier.height(24.dp))
            
            // Space Type
            Text(
                text = "Tipo de Espacio",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold
            )
            Spacer(modifier = Modifier.height(8.dp))
            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                SpaceType.values().forEach { type ->
                    FilterChip(
                        selected = selectedType == type,
                        onClick = { 
                            selectedType = if (selectedType == type) null else type
                        },
                        label = { Text(type.displayName()) }
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(24.dp))
            
            // Price Range
            Text(
                text = "Rango de Precio (por mes)",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold
            )
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                OutlinedTextField(
                    value = minPrice,
                    onValueChange = { minPrice = it },
                    label = { Text("Mínimo") },
                    prefix = { Text("$") },
                    modifier = Modifier.weight(1f)
                )
                OutlinedTextField(
                    value = maxPrice,
                    onValueChange = { maxPrice = it },
                    label = { Text("Máximo") },
                    prefix = { Text("$") },
                    modifier = Modifier.weight(1f)
                )
            }
            
            Spacer(modifier = Modifier.height(24.dp))
            
            // Size Range
            Text(
                text = "Tamaño (m²)",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold
            )
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                OutlinedTextField(
                    value = minSize,
                    onValueChange = { minSize = it },
                    label = { Text("Mínimo") },
                    suffix = { Text("m²") },
                    modifier = Modifier.weight(1f)
                )
                OutlinedTextField(
                    value = maxSize,
                    onValueChange = { maxSize = it },
                    label = { Text("Máximo") },
                    suffix = { Text("m²") },
                    modifier = Modifier.weight(1f)
                )
            }
            
            Spacer(modifier = Modifier.height(24.dp))
            
            // Features
            Text(
                text = "Características",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold
            )
            Spacer(modifier = Modifier.height(8.dp))
            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Constants.Features.SPACE_FEATURES.forEach { feature ->
                    FilterChip(
                        selected = feature in selectedFeatures,
                        onClick = { 
                            selectedFeatures = if (feature in selectedFeatures) {
                                selectedFeatures - feature
                            } else {
                                selectedFeatures + feature
                            }
                        },
                        label = { Text(feature) }
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(32.dp))
            
            // Action Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                OutlinedButton(
                    onClick = {
                        selectedType = null
                        minPrice = ""
                        maxPrice = ""
                        minSize = ""
                        maxSize = ""
                        selectedFeatures = emptySet()
                    },
                    modifier = Modifier.weight(1f)
                ) {
                    Text("Limpiar")
                }
                
                Button(
                    onClick = {
                        val params = SpaceSearchParams(
                            type = selectedType,
                            minPrice = minPrice.toDoubleOrNull(),
                            maxPrice = maxPrice.toDoubleOrNull(),
                            minSize = minSize.toDoubleOrNull(),
                            maxSize = maxSize.toDoubleOrNull(),
                            features = selectedFeatures.takeIf { it.isNotEmpty() }?.toList()
                        )
                        onApplyFilters(params)
                    },
                    modifier = Modifier.weight(1f)
                ) {
                    Text("Aplicar Filtros")
                }
            }
            
            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}

@Composable
fun FlowRow(
    modifier: Modifier = Modifier,
    horizontalArrangement: Arrangement.Horizontal = Arrangement.Start,
    verticalArrangement: Arrangement.Vertical = Arrangement.Top,
    content: @Composable () -> Unit
) {
    Layout(
        modifier = modifier,
        content = content
    ) { measurables, constraints ->
        val rows = mutableListOf<List<Placeable>>()
        var currentRow = mutableListOf<Placeable>()
        var currentRowWidth = 0
        
        measurables.forEach { measurable ->
            val placeable = measurable.measure(constraints)
            if (currentRowWidth + placeable.width > constraints.maxWidth) {
                rows.add(currentRow)
                currentRow = mutableListOf(placeable)
                currentRowWidth = placeable.width
            } else {
                currentRow.add(placeable)
                currentRowWidth += placeable.width
            }
        }
        if (currentRow.isNotEmpty()) {
            rows.add(currentRow)
        }
        
        val height = rows.sumOf { row ->
            row.maxOf { it.height }
        }
        
        layout(constraints.maxWidth, height) {
            var y = 0
            rows.forEach { row ->
                var x = 0
                val rowHeight = row.maxOf { it.height }
                row.forEach { placeable ->
                    placeable.placeRelative(x, y)
                    x += placeable.width
                }
                y += rowHeight
            }
        }
    }
}