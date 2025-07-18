import React from "react";
import {MapContextMenuProps} from "./constans";

export const MapContextMenu: React.FC<MapContextMenuProps> = ({ position, onClose, onSetMarker }) => (
    <div
        className="map-context-menu"
        style={{
            position: 'absolute',
            left: position.lng,
            top: position.lat,
        }}
    >
        <button onClick={() => onSetMarker('A')}>
            <span className="material-symbols-rounded">place</span>
            Установить метку A
        </button>
        <button onClick={() => onSetMarker('B')}>
            <span className="material-symbols-rounded">flag</span>
            Установить метку B
        </button>
        <button onClick={onClose}>
            <span className="material-symbols-rounded">close</span>
            Закрыть
        </button>
    </div>
);