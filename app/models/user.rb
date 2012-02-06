class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :token_authenticatable, :encryptable, :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  # Setup accessible (or protected) attributes for your model
  attr_accessible :email, :password, :password_confirmation, :remember_me
  
  has_many :habits, :dependent => :destroy
  has_many :rewards, :dependent => :destroy
  
  before_save :calculate_experience
  
  def calculate_experience
    self.exp = 0 if self.exp < 0
    if (self.exp > self.tnl)
      self.exp -= self.tnl # carry over
      self.lvl += 1
    end
  end

  #TODO figure this out. Google "RPG level up formula" or something
  def tnl
    # http://tibia.wikia.com/wiki/Formula
    50*self.lvl**2 - 150*self.lvl + 200
  end
end
