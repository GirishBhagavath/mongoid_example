class FavoritesController < ApplicationController

  def create
    favorite = Favorite.find_or_create_by(:url => params[:favorite][:url])

    respond_to do |format|
      format.html { redirect_to request.referrer }
      format.json { render :json => favorite }
    end
  end

  def destroy
    favorite = Favorite.find(params[:id]).destroy

    respond_to do |format|
      format.html { redirect_to request.referrer }
      format.json { render :json => favorite }
    end
  end

end
