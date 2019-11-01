class GraphD3 {
	constructor(graphData) {
		this.setData(graphData);
		// console.log(graphData, this.getGraphData());
	}

	setData(graphData) {
		this.data = graphData;
	}

	getData() {
		return this.data;
	}

  /**
   * Returns data for building graph
   * @returns Array - array of graph objects
   */
	getGraphData() {
		return this.getData().map(e => {
            return (Object.assign(e, {
              id: e.Uid,
              source: e.Uid,
              target: e.Depends_on || e.Uid,
              Depends: !e.Depends_on || this.getDataById(e.Depends_on).Location,
              links_amount: this.data.reduce(
                  (sum,_e) => (e.Uid !== _e.Uid && _e.Depends_on === e.Uid) ? sum + 1 :sum,
                  (e.Depends_on) ? 1 : 0
              )
            }));
		});
	}

  /**
   * Returns data by its id
   * @param uid - uid for data row
   */
    getDataById(uid) {
        return this.data.find(e => e.Uid === uid);
    }

  /**
   * Renders popup with node info
   * @param e - row from data rowset
   */
    renderNodePopup = (e) =>{
        const displayKeys = ['Uid', 'Host_name', 'Service_type', 'Asset_owner', 'Location','Depends','links_amount'];
        let html = '';
        displayKeys.forEach(key => {
            html +='<p>'+ key + ': ' + e[key] + '</p>';
        });
        return html;
    }

    /**
     * Renders graph with nodes and sets event handlers for displaying popup
     */
    render() {
        // Calculates coords for elements

        function ticked() {
            svg.selectAll(".link")
                .attr("x1", d => d.source.x )
                .attr("y1", d => d.source.y )
                .attr("x2", d => d.target.x )
                .attr("y2", d => d.target.y );

            svg.selectAll(".node")
                .attr("cx", d => d.x )
                .attr("cy", d => d.y );

            svg.selectAll(".text")
                .attr("x", d => d.x - 20 )
                .attr("y", d => d.y - 20 );
        }

        // Set our graph boundaries
        let graph = {
          height: 800,
          width: 960,
        };
         
        let graphData = this.getGraphData();
        let d3sim = d3.forceSimulation();
        let svg = d3.select("svg");

        d3sim.force("charge", d3.forceManyBody().strength(-200))
             .force("link", d3.forceLink().id( d=> d.id).distance(60))
             .force("x", d3.forceX(graph.width / 2))
             .force("y", d3.forceY(graph.height / 2))
             .on("tick", ticked);

        d3sim.nodes(graphData);
        d3sim.force("link").links(graphData);

        graph.link = svg.selectAll(".link");
        graph.node = svg.selectAll(".node");
        graph.text = svg.selectAll(".text");
        graph.popup = svg.selectAll(".foreignObject")
    //filter  shadow
    let defs = svg.append("defs");
    let filter = defs.append("filter")
            .attr("id", "drop-shadow")
            .attr("height", "120%")
            .attr('filterUnits','userSpaceOnUse');

    filter.append("feGaussianBlur")
            .attr("in", "SourceAlpha")
            .attr("stdDeviation", 5)
            .attr("result", "blur");

    filter.append("feOffset")
            .attr("in", "blur")
            .attr("dx", 2)
            .attr("dy", 2)
            .attr("result", "offsetBlur")
            
    let feMerge = filter.append("feMerge");
        feMerge.append("feMergeNode")
               .attr("in", "offsetBlur")
        feMerge.append("feMergeNode")
               .attr("in", "SourceGraphic");
    //

        graph.link
            .data(graphData)
            .enter()
            .append("line")
            .attr("class", "link");
    
        graph.node
            .data(graphData)
            .enter()
            .append("circle")
            .attr("class", "node")
            .attr("r", 12)
            .style("filter", "url(#drop-shadow)")
            .style("stroke", "rgba(0,0,0,0.5)")
            .on("mouseover", d =>  {

                graph.popup.data([0])
                    .enter()
                    .append('foreignObject')
                    .attr("class", "popup")
                    .attr("id", "popup")
                    .attr('width', 250)
                    .attr('height', 300)
                    .style("filter", "url(#drop-shadow)")
                    .attr('x', +event.target.attributes.cx.value +15 )
                    .attr('y',  +event.target.attributes.cy.value - graph.height / 2.7 +10 )
                    .style('fill', 'white')
                    .html( '<div class = "infomationSection" >'+this.renderNodePopup(d)+'</div>' ) 
            })
            .on("mouseout", () => {
                graph.popup._parents[0].removeChild( graph.popup._parents[0].lastChild);
            });

        graph.text
            .data(graphData)
            .enter()
            .append("text")
            .attr("class", "text")
            .attr("width", graph.width / 3)
            .attr("height", graph.height / 3)
            .style('fill', 'blanchedalmond')
            .text(d => d.Location);
    }
}

document.addEventListener("DOMContentLoaded", function(event) {
    let graphD3 = new GraphD3(graphJson);
    graphD3.render();
});
