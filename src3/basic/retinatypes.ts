// Retina Display Support //////////////////////////////////////////////
export interface HTMLCanvasElementEx extends HTMLCanvasElement {
    isRetinaEnabled?: boolean;    
    _isRetinaEnabled?: boolean;
    _bak?: object;
}

export interface CanvasRenderingContext2dEx extends CanvasRenderingContext2D {
    webkitBackingStorePixelRatio?:number; 
    mozBackingStorePixelRatio?:number; 
    msBackingStorePixelRatio?:number; 
    oBackingStorePixelRatio?:number; 
    backingStorePixelRatio?:number;
}
