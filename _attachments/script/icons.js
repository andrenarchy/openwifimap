function wifiIcon(canvas, x,y, power, direction, angle, color){
    var	angle1	= direction+angle/2,
        angle2	= direction-angle/2,
        start	= Math.min(angle1, angle2),
        stop	= Math.max(angle1, angle2),
        color	= color || "rgba(0,0,255,0.8)",
        radius	= power


            ctx=canvas.getContext("2d")			

            var grd1=ctx.createRadialGradient(x,y,0,x,y,radius*0.7)
            grd1.addColorStop(0,	"transparent")

            var pulses	= Math.floor(power*1/75)+3,
        i		= 0

            while(i<pulses){	
                i++
                    grd1.addColorStop(Math.max(i/pulses-0.06, 0),	"rgba(0,0,255,"+(0.8-(0.35*i/pulses))+")")
                    grd1.addColorStop(Math.max(i/pulses-0.01, 0),	"rgba(0,0,255,"+(0.8-(0.35*i/pulses))+")")
                    grd1.addColorStop(i/pulses,						"transparent")
            }	

    var grd2=ctx.createRadialGradient(x,y,0,x,y,radius)
        grd2.addColorStop(0,	"rgba(0,0,255,0.8)")
        grd2.addColorStop(0.5,	"rgba(0,0,255,0.7)")
        grd2.addColorStop(1.0,	"transparent")


        ctx.beginPath()
        ctx.moveTo(x,y)
        ctx.arc(x,y,power,start,stop)
        ctx.moveTo(x,y)
        ctx.fillStyle=grd1
        ctx.fill()
        if(angle<2*Math.PI){
            ctx.beginPath()
                ctx.moveTo(x,y)
                ctx.lineTo(x+Math.cos(start)*power*1.2, y+Math.sin(start)*power*1.2)
                ctx.moveTo(x,y)
                ctx.lineTo(x+Math.cos(stop)*power*1.2, y+Math.sin(stop)*power*1.2)
                ctx.strokeStyle=grd2
                ctx.lineWidth=power*0.025
                ctx.stroke()
        }else{
        }	
    ctx.beginPath()
        ctx.moveTo(x,y)
        ctx.arc(x,y,3,0,2*Math.PI)
        ctx.fillStyle="rgba(0,0,0,0.8)"
        ctx.fill()
}

function getAntennaIconSVG(h, w, antenna) {
    var data = {
        antenna: antenna,
        h: h,
        w: w,
        hh: h/2,
        hw: w/2,
        r: h*0.45,
        paths: ((antenna && antenna.direction && antenna.beamH) ?
                function() {
                    var ant = this.antenna,
        cx = this.hw,
        cy = this.hh,
        r = this.r,
        start = (ant.direction - ant.beamH/2)*2*Math.PI/360,
        aperture = ant.beamH*2*Math.PI/360,
        startxy = [ Math.cos(start)*r, Math.sin(start)*r ],
        endxy = [ Math.cos(start+aperture)*r - startxy[0], Math.sin(start+aperture)*r - startxy[1] ],
        ret = '';
        ret += '<path d="M' + cx + ',' + cy + ' l' + startxy[0] + ' ' + startxy[1] + ' a' + r + ',' + r + ' ' + start + ' ' + ((aperture<Math.PI)? '0' : '1') +',1 ' + endxy[0] + ',' + endxy[1] + ' z' + '" fill="url(#gradfill)" />';
        ret += '<line x1="'+cx+'" y1="'+cy+'" x2="'+(cx+startxy[0])+'" y2="'+(cy+startxy[1])+'" stroke="url(#gradline)" stroke-width="2" />';
        ret += '<line x1="'+cx+'" y1="'+cy+'" x2="'+(cx+endxy[0]+startxy[0])+'" y2="'+(cy+endxy[1]+startxy[1])+'" stroke="url(#gradline)" stroke-width="2" />';
        ret += '<circle cx="'+cx+'" cy="'+cy+'" r="'+0.1*r+'" />';
        return ret;
                }
                :
                function () {
                    var ant = this.antenna,
        cx = this.hw,
        cy = this.hh,
        r = this.r,
        ret = '';
                    ret += '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="url(#gradfill)" />';
                    ret += '<circle cx="'+cx+'" cy="'+cy+'" r="'+0.1*r+'" />';
                    return ret;
                })
    }
    svg = ich.mapiconsvg(data, true);
    return svg;
}
