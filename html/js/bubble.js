function bubble(hour,current_view) {
  var BubbleChart, root,
    __bind = function(fn, me){return function(){ return fn.apply(me, arguments); }; };

  BubbleChart = (function() {
    function BubbleChart(data) {
     this.hide_details = __bind(this.hide_details, this);
      this.show_details = __bind(this.show_details, this);
      this.hide_years = __bind(this.hide_years, this);
      this.display_years = __bind(this.display_years, this);
      this.move_towards_outer = __bind(this.move_towards_outer, this);
      this.display_by_type = __bind(this.display_by_type, this);
      this.move_towards_center = __bind(this.move_towards_center, this);
      this.display_group_all = __bind(this.display_group_all, this);
      this.start = __bind(this.start, this);
      this.create_vis = __bind(this.create_vis, this);
      this.create_nodes = __bind(this.create_nodes, this);
      this.data = data
      var max_amount;
      this.width = 1200;
      this.height = 500;
      this.center = {
        x: this.width / 2,
        y: this.height / 2
      };
      this.centers = {
        'Verified users' : {
          x: this.width / 3,
          y: this.height / 2
        },
        'Normal users' : {
          x: 2 * this.width / 3,
          y: this.height / 2
        }
      };
      this.layout_gravity = -0.01;
      this.damper = 0.1;
      this.vis = null;
      this.nodes = [];
      this.force = null;
      this.circles = null;
      max_amount = d3.max(this.data, function(d) {
        return parseInt(d.amount);
      });
      this.radius_scale = d3.scale.pow().exponent(0.5).domain([0, max_amount]).range([2, 50]);
      this.create_nodes();
      this.create_vis();
    }

    BubbleChart.prototype.create_nodes = function() {
      var _this = this;
      this.data.forEach(function(d) {
        var node;
        if(authors[d.user]){
          v = authors[d.user].verified
        }else{
          v = false
        }
        node = {
          id: d.tweet_id,
          radius: _this.radius_scale(d.amount),
          tweet: d.tweet,
          value: d.amount,
          name: d.user,
          org: d.organization,
          verified : v,
          group: 1,
          year: 1,
          x: Math.random() * 900,
          y: Math.random() * 800
        };
        return _this.nodes.push(node);
      });
      return this.nodes.sort(function(a, b) {
        return b.value - a.value;
      });
      
    };

    BubbleChart.prototype.create_vis = function() {
      var that,
        _this = this;
      d3.select('#bubble').selectAll("svg").remove()
      this.vis = d3.select("#bubble").append("svg").attr("width", this.width).attr("height", this.height).attr("id", "svg_vis");
      this.circles = this.vis.selectAll("circle").data(this.nodes, function(d) {
        return d.id;
      });
      that = this;
      this.circles.enter().append("circle").attr("r", 0).attr("fill", function(d){
        if(d.verified){
          return '#333'
        }
        return '#999'
      }).attr("stroke-width", 2).attr("stroke", function(d) {
        return '#777'
      }).attr("id", function(d) {
        return "bubble_" + d.id;
      }).on("mouseover", function(d, i) {
        return that.show_details(d, i, this);
      }).on("mouseout", function(d, i) {
        return that.hide_details(d, i, this);
      });
      return this.circles.transition().duration(2000).attr("r", function(d) {
        return d.radius
      });
    };

    BubbleChart.prototype.charge = function(d) {
      return -Math.pow(d.radius, 2.0) / 8;
    };

    BubbleChart.prototype.start = function() {
      return this.force = d3.layout.force().nodes(this.nodes).size([this.width, this.height]);
    };

    BubbleChart.prototype.display_group_all = function() {
      var _this = this;
      this.force.gravity(this.layout_gravity).charge(this.charge).friction(0.9).on("tick", function(e) {
        return _this.circles.each(_this.move_towards_center(e.alpha)).attr("cx", function(d) {
          return d.x;
        }).attr("cy", function(d) {
          return d.y;
        });
      });
      this.force.start();
    };

    BubbleChart.prototype.move_towards_center = function(alpha) {
      var _this = this;
      return function(d) {
        d.x = d.x + (_this.center.x - d.x) * (_this.damper + 0.02) * alpha;
        return d.y = d.y + (_this.center.y - d.y) * (_this.damper + 0.02) * alpha;
      };
    };

     BubbleChart.prototype.display_by_type = function() {
      var _this = this;
      this.force.gravity(this.layout_gravity).charge(this.charge).friction(0.9).on("tick", function(e) {
        return _this.circles.each(_this.move_towards_outer(e.alpha)).attr("cx", function(d) {
          return d.x;
        }).attr("cy", function(d) {
          return d.y;
        });
      });
      this.force.start();
      return this.display_years();
    };

    BubbleChart.prototype.move_towards_outer = function(alpha) {
      var _this = this;
      return function(d) {
        var target;
        if(d.verified){
          target = _this.centers['Verified users'];
        }else{
          target = _this.centers['Normal users'];
        }
        d.x = d.x + (target.x - d.x) * (_this.damper + 0.02) * alpha * 1.1;
        return d.y = d.y + (target.y - d.y) * (_this.damper + 0.02) * alpha * 1.1;
      };
    };

    BubbleChart.prototype.display_years = function() {
      var years, years_data, years_x,
        _this = this;
      years_x = {
        'Verified users': this.width / 3,
        'Normal users':  this.width / 3 * 2
      };
      years_data = d3.keys(years_x);
      years = this.vis.selectAll(".types").data(years_data);
      return years.enter().append("text").attr("class", "types").attr("x", function(d) {
        return years_x[d];
      }).attr("y", 40).attr("text-anchor", "middle").text(function(d) {
        return d;
      });
    };

    BubbleChart.prototype.hide_years = function() {
      var types;
      return types = this.vis.selectAll(".types").remove();
    };

    BubbleChart.prototype.show_details = function(data, i, element) {
      var content;
      el = d3.select(element)
      el.attr("stroke", "black");
      content = "<span class=\"name\">User:</span><span class=\"value\"> " + data.name + "</span><br/>";
      content += "<span class=\"name\">Tweet:</span><span class=\"value\"> " + urlize(data.tweet)+ "</span><br/>";
      content += "<span class=\"name\">Amount:</span><span class=\"value\">" + data.value + "</span>";
      d3.select('#tooltip').html(content).transition().duration(1000).style("opacity",1)
    };

    BubbleChart.prototype.hide_details = function(data, i, element) {
      var _this = this;
      d3.select("#tooltip").transition().duration(1000).style("opacity",0)
      d3.select(element).attr("stroke", function(d) {
        return "#777";
      });
    };

    return BubbleChart;

  })();

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  visualize = function(hour,current_view) {
    var chart, render_vis,
      _this = this;
    chart = null;
    render = function(json){
      j = json[hour]
      chart = new BubbleChart(j);
      chart.start();
      if ( current_view == 'all') {
        root.display_all();
      }else{
        root.display_type();
      }
      this.current_view = current_view
    }

    root.display_all = function() {
      chart.hide_years()
      return chart.display_group_all();
    };
    root.display_type = function() {
      return chart.display_by_type();
    };
    root.toggle_view = function() {
      if (this.current_view == 'all') {
        this.current_view = 'type';
        return root.display_type();
      } else {
        this.current_view = 'all';
        chart.hide_years()
        return root.display_all();
      }
    };
    root.get_current_view = function(){
      return this.current_view
    }
    return d3.json("data/popular_tweets.json", render);
  }
  visualize(hour,current_view)
}

function urlize(content){
  if (content.length > 0) {
    var list = content.match( /\b(http:\/\/|www\.|http:\/\/www\.)[^ <]{2,200}\b/g );
    if (list) {
      for ( i = 0; i < list.length; i++ ) {
        var prot = list[i].indexOf('http://') === 0 || list[i].indexOf('https://') === 0 ? '' : 'http://';
        content = content.replace( list[i], "<a target='_blank' href='" + prot + list[i] + "'>"+ list[i] + "</a>" );
      }
    }
  }
  return content
}

var request = new XMLHttpRequest();
request.open("GET", "data/userProfiles.json", false);
request.send(null)
var authors = JSON.parse(request.responseText);

window.onload = function(){
  bubble(0,'all')
  button = d3.select('#options').append('button')
  button.on('click',function(){
    toggle_view()
  })
  button.html('Click me to change between graphs!')
}


setTimeout(function() {bubble(1,get_current_view())}, 10000);
setTimeout(function() {bubble(2,get_current_view())}, 20000);
