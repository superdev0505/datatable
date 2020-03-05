function DataTable(data) {
    this.table_container = $('<div class="ld-datatable-container"></div>');
    this.table = $(data.table);
    this.table.addClass('ld-datatable');
    // this.table.parent().css('overflow-x', 'auto');
    if (data.ajax) {
        this.ajax = data.ajax;
    } else {
        this.ajax = ''
    }
    var min_width = this.table.parent().width();

    this.table_container.css('min-width', min_width);
    this.table_container.css('overflow-x', 'auto');
    this.table_container.appendTo(this.table.parent());
    this.table_container.append(this.table);
    this.start_pos = 0;
    if (data.hide) {
        this.hide = data.hide;
    } else {
        this.hide = [];
    }
    if (data.pagination) {
        this.amount_per_page = data.pagination
    } else {
        this.amount_per_page = 40;
    }

    if (data.data) {
        this.data = data.data;
    } else {
        this.data = {};
    }

    if (data.filter) {
        this.filter = data.filter;
    } else {
        this.filter = {};
    }

    if (data.sort) {
        this.sort = data.sort;
    } else {
        this.sort = {};
    }

    if (data.row_height) {
        this.row_height = data.row_height
    } else {
        this.row_height = 40
    }

    this.move = $('<span class="ui-icon ui-icon-arrow-4 ld-datatable-move-handle"></span>');
    this.moving_flag = false;

    this.resize = $('<span class="ld-datatable-resize-handle"></span>');
    this.resizing_flag = false;

    this.ghost = $('<div class="ld-datatable-move-ghost-placeholder"><span class="title"></span></div>');
    this.ghost.css('position', 'absolute');
    this.ghost.css('z-index', '40');
    var that = this;

    $.post(
        that.ajax, {
        start_pos: that.start_pos,
        limit: that.amount_per_page,
        filter: that.filter
    },
        function (data) {
            that.data = data;
            that.render(data);
            var div = $('<div class="ld-datatable-scroller"></div');
            var height = that.data.info.total_amount * this.cell_height;
            div.height(height);
            that.table_container.append(div);
            var ths = $('th', that.table);
            for (var i = 0; i < ths.length; i ++) {
                var width = ths.eq(i).width();
                ths.eq(i).width(width);
            }
        }
    )

    that.table.on('mouseover', 'th:not(.ld-datatable-fixed)', function () {
        $(this).prepend(that.move);
        $(this).append(that.resize);
    });
    that.table.on('mouseleave', 'th:not(.ld-datatable-fixed)', function () {
        that.move.remove();
        that.resize.remove();
    });

    that.table.on('mouseover', 'th.ld-datatable-fixed', function () {
        $(this).append(that.resize);
    });
    that.table.on('mouseleave', 'th.ld-datatable-fixed', function () {
        that.resize.remove();
    });

    that.table.on('mouseover', '.ld-datatable-resize-handle', function () {
        that.resize.css('opacity', 1);
        that.resize.css('cursor', 'col-resize');
    });
    that.table.on('mouseleave', '.ld-datatable-resize-handle', function () {
        that.resize.css('opacity', 0);
        that.resize.css('cursor', 'auto');
    });

    that.table.on('mouseover', '.ld-datatable-move-handle', function () {
        that.move.css('cursor', 'pointer');
    });
    that.table.on('mouseleave', '.ld-datatable-move-handle', function () {
        that.move.css('cursor', 'auto');
    });

    that.table_container.on('scroll', function (e) {
        var left = $(this).scrollLeft();
        if (left > 0) {
            $('.ld-datatable-fixed', that.table).css('opacity', '0.7');
        } else {
            $('.ld-datatable-fixed', that.table).css('opacity', '1');
        }
        if (that.ajax) {
            var top = $(this).scrollTop();

            var position = Math.floor((top / 38));
            if( that.start_pos !=  Math.floor(position / 10)) {
                $.post(
                    that.ajax, {
                    start_pos: (position - Math.floor(that.amount_per_page / 2)) > 0 ? (position - Math.floor(that.amount_per_page / 2)) : 0,
                    limit: that.amount_per_page,
                    filter: that.filter,
                    sort: that.sort
                },
                    function (data) {
                        that.data = data;
                        that.render(data);
                        that.start_pos = Math.floor(position / 10);

                        if(position > Math.floor(that.amount_per_page / 2))
                            that.table.css('top',(top - Math.floor(that.amount_per_page / 2) * 38) + 'px');
                        else
                            that.table.css('top',0 + 'px');
                    }
                )
            }
        }
    });
    $(document).on('mousedown', '.ld-datatable-move-handle', function (e) {
        if (!that.resizing_flag && !that.moving_flag) {
            that.moving_flag = true;
            var th = $(this).parent();
            var title = th.text();
            th.addClass('ld-datatable-move-helper');
            var width = th.outerWidth();
            that.ghost.outerWidth(width);
            $('.title', that.ghost).text(title);
            var th_pos = th.offset();
            that.table_container.append(that.ghost);
            that.ghost.offset(th_pos);
            that.cur_pos = {
                top: e.pageY,
                left: e.pageX
            }
        }
    });
    $(document).on('mousedown', '.ld-datatable-resize-handle', function (e) {
        if (!that.resizing_flag && !that.moving_flag) {
            that.resizing_flag = true;
            var th = $(this).parent();
            th.addClass('ld-datatable-resizing-helper');
            that.cur_pos = {
                top: e.pageY,
                left: e.pageX
            }
        }
    });
    $(document).on('mousemove', function (e) {
        if (that.moving_flag === true || that.resizing_flag === true) {
            that.table.css('user-select', 'none');
        } 
        if (that.moving_flag === true) {
            var ghost_pos = that.ghost.offset();
            var current_offset = {
                top: ghost_pos.top + e.pageY - that.cur_pos.top,
                left: ghost_pos.left + e.pageX - that.cur_pos.left
            };
            that.ghost.offset(current_offset);
            that.cur_pos = {
                top: e.pageY,
                left: e.pageX
            }
            var ths = $('th', that.table).not('.ld-datatable-fixed');
            for (var i = 0; i < ths.length; i++) {
                if (that.cur_pos.left > ths.eq(i).offset().left) {
                    if (i < ths.length - 1 && that.cur_pos.left < ths.eq(i + 1).offset().left) {
                        ths.removeClass('ld-datatable-move-hover');
                        ths.eq(i).addClass('ld-datatable-move-hover');
                    } else if (i == ths.length - 1) {
                        ths.removeClass('ld-datatable-move-hover');
                        ths.eq(i).addClass('ld-datatable-move-hover');
                    }
                }
            }
        }
        if (that.resizing_flag == true) {
            var offset = e.pageX - that.cur_pos.left;
            that.cur_pos = {
                top: e.pageY,
                left: e.pageX
            }
            var container_width = that.table.width();
            container_width = container_width + offset;
            that.table.width(container_width);
            var th = $('th.ld-datatable-resizing-helper', that.table);
            var width = th.width();
            width = width + offset;
            th.width(width);
        }
    });
    $(document).on('mouseup', function (e) {
        that.table.css('user-select', 'initial');
        if (that.moving_flag) {
            that.moving_flag = false;
            that.ghost.remove();
            var before = false;
            var helper = $('th.ld-datatable-move-helper', that.table);
            var helper_index = $('th', that.table).index(helper[0]);
            var move = $('th.ld-datatable-move-hover', that.table);
            var move_index = $('th', that.table).index(move[0]);
            if (helper_index != move_index) {
                if (helper_index > move_index) {
                    before = true
                }
                var trs = $('tbody tr', that.table);
                for (var i = 0; i < trs.length; i++) {
                    var tr = trs.eq(i);
                    var cell_helper = $('td', tr).eq(helper_index);
                    var cell_move = $('td', tr).eq(move_index);
                    if (before) {
                        cell_helper.insertBefore(cell_move);
                    } else {
                        cell_helper.insertAfter(cell_move);
                    }
                }
                if (before) {
                    helper.insertBefore(move);
                } else {
                    helper.insertAfter(move);
                }
            }
            helper.removeClass('ld-datatable-move-helper');
            move.removeClass('ld-datatable-move-hover');
        }
        if (that.resizing_flag) {
            that.resizing_flag = false;
            var th = $('th.ld-datatable-resizing-helper', that.table);
            th.removeClass('ld-datatable-resizing-helper');
        }
    });
}
DataTable.prototype.filter = function (filter) {
    var that = this;
    that.filter = {...that.filter, filter};
    $.post(
        that.ajax, {
        start_pos: that.start_pos,
        limit: that.amount_per_page,
        filter: filter,
        sort: that.sort
    },
        function (data) {
            that.data = data;
            that.render();
        }
    )
}

DataTable.prototype.sort = function (sort) {
    var that = this;
    that.sort = {...that.sort, sort};
    $.post(
        that.ajax, {
        start_pos: that.start_pos,
        limit: that.amount_per_page,
        filter: that.filter,
        sort: that.sort
    },
        function (data) {
            that.data = data;
            that.render();
        }
    )
}

DataTable.prototype.hideColumn = function (hide) {
    this.hide = hide;
    this.render();
}

DataTable.prototype.render = function () {
    var headers = $('thead th', this.table);
    var order = [];
    var that = this;
    var j = 0;
    if (headers.length) {
        headers.show();
        for (var i = 0; i < headers.length; i ++) {
            field_name = headers.eq(i).attr('field_name');
            if (that.hide.indexOf(field_name) == -1) {
                order[j] = headers.eq(i).attr('field_name');
                j ++;
            } else {
                headers.eq(i).hide();
            }
        }
    } else {
        var head = $('<thead></thead>');
        var tr = $('<tr></tr>');
        var select_column = $('<select multiple class="ld-datatable-column-select"></select>')
        head.append(tr);
        that.table.append(head);
        i = 0;
        Object.entries(that.data.fields).forEach((field) => {
            var th = $('<th field_name=' + field[0] + '>' + field[1] + '</th>');
            tr.append(th);
            var option = $('<option value="' + field[0] + '">' + field[1] + '</option>');
            select_column.append(option);
            if (that.hide.indexOf(field[0]) == -1) {
                order[i] = field[0];
            } else {
                th.hide();
            }
            if (i == 0) {
                th.addClass('ld-datatable-fixed');
            }
            i ++;
        });
        var select_container = $('<div class="ld-datatable-column-filter"></div>');
        that.table_container.parent().prepend(select_container);
        select_container.append(select_column);
        select_column.on('change', function() {
            that.hideColumn(select_column.val());
        })
    }
    var body = $('tbody', that.table);
    if (!body.length) {
        body = $('<tbody></tbody>');
        this.table.append(body);
    }
    body.empty();
    for(j = 0; j < this.data.data.length; j ++) {
        var data = this.data.data[j]
        var tr = $('<tr></tr>');
        body.append(tr);
        for (var k = 0; k < order.length; k ++) {
            td = $('<td>' + data[order[k]] + '</th>');
            if (k == 0) {
                td.addClass('ld-datatable-fixed');
            }
            tr.append(td);
        }
    }
    if (this.row_height != 40) {
        $('tr', this.table).height(this.row_height);
    }
}