LoadingGifController = function() {
    /**
     * Render the spinner
     */
    this.render = function() {
        $('#loadingGif').modal('show');
        $(".close").hide();
    };
    
    /**
     * Destroy the spinner
     */
    this.destroy = function() {
        $('#loadingGif').modal('hide');
    };
};
LoadingGifController = new LoadingGifController();